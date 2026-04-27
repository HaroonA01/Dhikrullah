import { useCallback, useMemo, useState } from 'react';
import {
  AppState,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  Minus,
  Plus,
} from 'lucide-react-native';
import { CategoryId } from '@/types';
import { useDhikrContent } from '@/context/CounterContext';
import { useCounter } from '@/hooks/useCounter';
import { useFavourites } from '@/context/FavouritesContext';
import { useTheme } from '@/context/ThemeContext';
import { resolveAudio } from '@/db/audioMap';
import {
  getMeta,
  incrementTimeSecondsForDate,
  setMeta,
} from '@/db/queries';
import { META_KEY_LIFETIME_SECONDS, todayKey } from '@/lib/stats';
import { DhikrPager } from '@/components/DhikrPager';
import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { ProgressBar } from '@/components/ProgressBar';
import { CountDisplay } from '@/components/CountDisplay';
import { ActionPill } from '@/components/ActionPill';
import { InfoModal } from '@/components/InfoModal';
import { AudioButton } from '@/components/AudioButton';
import { Confetti } from '@/components/Confetti';
import { CardProgressRing } from '@/components/CardProgressRing';

export default function CounterScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { palette } = useTheme();
  const categoryId = category as CategoryId;
  const { categories, dhikrsByCategory } = useDhikrContent();
  const meta = categories.find((c) => c.id === categoryId);
  const dhikrs = dhikrsByCategory[categoryId] ?? [];
  const {
    hydrated,
    state,
    confettiTick,
    incrementCurrent,
    decrementCurrent,
    nextDhikr,
    prevDhikr,
  } = useCounter(categoryId);
  const { toggle, isFavourite } = useFavourites();
  const [infoOpen, setInfoOpen] = useState(false);
  const [cardSize, setCardSize] = useState({ w: 0, h: 0 });

  useFocusEffect(
    useCallback(() => {
      let start = Date.now();
      const flush = async () => {
        const seconds = Math.round((Date.now() - start) / 1000);
        start = Date.now();
        if (seconds <= 0) return;
        try {
          await incrementTimeSecondsForDate(todayKey(), seconds);
          const lifetime = Number(
            (await getMeta(META_KEY_LIFETIME_SECONDS)) ?? '0',
          );
          await setMeta(META_KEY_LIFETIME_SECONDS, String(lifetime + seconds));
        } catch {}
      };
      const sub = AppState.addEventListener('change', (next) => {
        if (next === 'active') start = Date.now();
        else flush();
      });
      return () => {
        flush();
        sub.remove();
      };
    }, []),
  );

  const { percent, completed } = useMemo(() => {
    if (!dhikrs.length) return { percent: 0, completed: 0 };
    let totalTarget = 0;
    let totalCount = 0;
    let done = 0;
    for (const d of dhikrs) {
      totalTarget += d.target;
      const c = state?.counts[d.id] ?? 0;
      totalCount += Math.min(c, d.target);
      if (c >= d.target) done += 1;
    }
    return {
      percent: totalTarget ? (totalCount / totalTarget) * 100 : 0,
      completed: done,
    };
  }, [dhikrs, state]);

  if (!hydrated) {
    return (
      <View style={styles.fallback}>
        <GradientBackground />
        <Text style={{ color: palette.textMid }}>Loading…</Text>
      </View>
    );
  }

  if (!meta) {
    return (
      <View style={styles.fallback}>
        <GradientBackground />
        <Text style={{ color: palette.textMid }}>
          Unknown category: {String(category)}
        </Text>
      </View>
    );
  }

  const currentDhikr = dhikrs[state.currentDhikrIndex];
  const count = currentDhikr ? state.counts[currentDhikr.id] ?? 0 : 0;
  const isFirst = state.currentDhikrIndex === 0;
  const isLast = state.currentDhikrIndex >= dhikrs.length - 1;
  const reachedTarget = !!currentDhikr && count >= currentDhikr.target;
  const favourited = currentDhikr ? isFavourite(currentDhikr.id) : false;
  const dhikrPercent = currentDhikr
    ? (Math.min(count, currentDhikr.target) / currentDhikr.target) * 100
    : 0;

  const onCardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== cardSize.w || height !== cardSize.h) {
      setCardSize({ w: width, h: height });
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <GradientBackground />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerBtn}
          hitSlop={12}
        >
          <ChevronLeft size={24} color={palette.accent} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerBrand, { color: palette.accent }]}>
            DHIKRULLAH
          </Text>
          <Text style={[styles.headerLabel, { color: palette.textDark }]}>
            {meta.label}
          </Text>
          <Text style={[styles.headerSub, { color: palette.textMid }]}>
            {state.currentDhikrIndex + 1} of {dhikrs.length}
          </Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <ProgressBar percent={percent} completed={completed} total={dhikrs.length} />

      <View style={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
        {currentDhikr ? (
          <Animated.View
            key={currentDhikr.id}
            entering={SlideInRight.duration(260)}
            exiting={SlideOutLeft.duration(180)}
            style={styles.cardWrap}
          >
            <View onLayout={onCardLayout} style={styles.cardInner}>
              <Pressable
                onPress={incrementCurrent}
                disabled={reachedTarget}
                style={styles.cardPressable}
              >
                <GlassCard style={styles.card}>
                  <Pressable
                    onPress={() => setInfoOpen(true)}
                    style={[
                      styles.cornerLeft,
                      {
                        backgroundColor: palette.glassBg,
                        borderColor: palette.glassBorder,
                      },
                    ]}
                    hitSlop={10}
                  >
                    <Info size={18} color={palette.accent} strokeWidth={2} />
                  </Pressable>
                  <View style={styles.cornerRight}>
                    <AudioButton
                      source={resolveAudio(currentDhikr.audioFilename)}
                      dhikrId={currentDhikr.id}
                    />
                  </View>

                  <CountDisplay count={count} target={currentDhikr.target} />
                  <DhikrPager dhikr={currentDhikr} />
                </GlassCard>
              </Pressable>
              {cardSize.w > 0 && cardSize.h > 0 && (
                <CardProgressRing
                  percent={dhikrPercent}
                  width={cardSize.w}
                  height={cardSize.h}
                />
              )}
            </View>
          </Animated.View>
        ) : (
          <Text style={{ color: palette.textMid, textAlign: 'center' }}>
            No dhikrs in this category.
          </Text>
        )}

        <View style={styles.actions}>
          <ActionPill
            Icon={ChevronLeft}
            onPress={prevDhikr}
            disabled={isFirst}
          />
          <ActionPill
            Icon={Minus}
            onPress={decrementCurrent}
            disabled={count === 0}
          />
          <ActionPill
            Icon={Heart}
            onPress={() => currentDhikr && toggle(currentDhikr.id)}
            disabled={!currentDhikr}
            active={favourited}
            iconFill
          />
          <ActionPill
            Icon={Plus}
            onPress={incrementCurrent}
            disabled={reachedTarget}
          />
          <ActionPill
            Icon={ChevronRight}
            onPress={nextDhikr}
            disabled={isLast}
          />
        </View>
      </View>

      <Confetti triggerKey={confettiTick} />

      <InfoModal
        visible={infoOpen}
        description={currentDhikr?.description ?? null}
        reference={currentDhikr?.reference ?? null}
        grade={currentDhikr?.grade ?? null}
        onClose={() => setInfoOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerLabel: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  cardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  cardInner: {
    position: 'relative',
  },
  cardPressable: {},
  card: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  cornerLeft: {
    position: 'absolute',
    top: 12,
    left: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 2,
  },
  cornerRight: {
    position: 'absolute',
    top: 12,
    right: 14,
    zIndex: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 4,
  },
});
