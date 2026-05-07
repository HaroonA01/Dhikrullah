import { useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  Minus,
  Plus,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { DhikrPager } from '@/components/DhikrPager';
import { GradientBackground } from '@/components/GradientBackground';
import { MihrabTile } from '@/components/MihrabTile';
import { MIHRAB_ASPECT } from '@/components/mihrabPath';
import { ProgressBar } from '@/components/ProgressBar';
import { CountDisplay } from '@/components/CountDisplay';
import { ActionPill } from '@/components/ActionPill';
import { GhostArrow } from '@/components/GhostArrow';
import { InfoModal } from '@/components/InfoModal';
import { AudioButton } from '@/components/AudioButton';
import { CardProgressRing } from '@/components/CardProgressRing';
import { TutorialTarget } from '@/components/tutorial/TutorialTarget';
import type { Dhikr } from '@/types';

const SCREEN_W = Dimensions.get('window').width;
const TILE_WIDTH = Math.min(SCREEN_W - 112, 300);
const TILE_HEIGHT = TILE_WIDTH * MIHRAB_ASPECT;

const SAMPLE_DHIKR: Dhikr = {
  id: 'tutorial.subhanallah',
  categoryId: 'all_day',
  arabic: 'سُبْحَانَ اللَّٰه',
  transliteration: 'Subhanallah',
  translation: 'Glory be to Allah',
  target: 10,
  description: 'A sample dhikr used during the tutorial. Counts here do not affect your stats.',
  reference: 'Sahih al-Bukhari',
  grade: 'Sahih',
  audioFilename: null,
  sortOrder: 0,
};

export default function TutorialCounter() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { palette } = useTheme();
  const [count, setCount] = useState(0);
  const [favourited, setFavourited] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [tileRowH, setTileRowH] = useState(0);

  const dhikr = SAMPLE_DHIKR;
  const reachedTarget = count >= dhikr.target;
  const dhikrPercent = (Math.min(count, dhikr.target) / dhikr.target) * 100;
  const overallPercent = dhikrPercent;

  const incrementCurrent = () => setCount((c) => Math.min(c + 1, 999));
  const decrementCurrent = () => setCount((c) => Math.max(0, c - 1));

  const tapGesture = useMemo(
    () => Gesture.Tap()
      .maxDeltaX(10)
      .maxDeltaY(10)
      .onEnd(() => { runOnJS(incrementCurrent)(); }),
    [],
  );

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
            Tutorial
          </Text>
          <Text style={[styles.headerSub, { color: palette.textMid }]}>
            Sample dhikr — counts don’t persist
          </Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <ProgressBar percent={overallPercent} completed={reachedTarget ? 1 : 0} total={1} />

      <View style={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.tileRow} onLayout={e => setTileRowH(e.nativeEvent.layout.height)}>
          <View style={styles.tileWrap}>
            <GestureDetector gesture={tapGesture}>
              <TutorialTarget id="counter.tile" style={styles.tilePressable}>
                <MihrabTile width={TILE_WIDTH}>
                  <View style={styles.countSlot}>
                    <CountDisplay
                      count={count}
                      target={dhikr.target}
                      reachedTarget={reachedTarget}
                    />
                  </View>
                  <View style={styles.pagerSlot}>
                    <TutorialTarget id="counter.pager" style={styles.pagerTarget}>
                      <DhikrPager dhikr={dhikr} />
                    </TutorialTarget>
                  </View>
                </MihrabTile>
              </TutorialTarget>
            </GestureDetector>
            <CardProgressRing
              percent={dhikrPercent}
              width={TILE_WIDTH}
              height={TILE_HEIGHT}
              stroke={4}
            />
            <TutorialTarget id="counter.info" style={styles.cornerLeft}>
              <Pressable
                onPress={() => setInfoOpen(true)}
                style={[
                  styles.cornerBtn,
                  { backgroundColor: palette.glassBg },
                ]}
                hitSlop={10}
              >
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    styles.cornerLeftBorder,
                    { borderColor: palette.glassBorder },
                  ]}
                />
                <Info size={18} color={palette.accent} strokeWidth={2} />
              </Pressable>
            </TutorialTarget>
            <TutorialTarget id="counter.audio" style={styles.cornerRight}>
              <AudioButton source={undefined} dhikrId={dhikr.id} />
            </TutorialTarget>
          </View>

          <View
            style={[styles.arrowLeft, tileRowH > 0 && {
              top: (tileRowH - TILE_HEIGHT) / 2 + TILE_HEIGHT * 0.60 - 32,
            }]}
            pointerEvents="box-none"
          >
            <TutorialTarget id="counter.arrowLeft">
              <GhostArrow Icon={ChevronLeft} onPress={() => {}} />
            </TutorialTarget>
          </View>
          <View
            style={[styles.arrowRight, tileRowH > 0 && {
              top: (tileRowH - TILE_HEIGHT) / 2 + TILE_HEIGHT * 0.60 - 32,
            }]}
            pointerEvents="box-none"
          >
            <TutorialTarget id="counter.arrowRight">
              <GhostArrow Icon={ChevronRight} onPress={() => {}} />
            </TutorialTarget>
          </View>
        </View>

        <View style={styles.actions}>
          <TutorialTarget id="counter.minus">
            <ActionPill
              Icon={Minus}
              onPress={decrementCurrent}
              disabled={count === 0}
            />
          </TutorialTarget>
          <TutorialTarget id="counter.heart">
            <ActionPill
              Icon={Heart}
              onPress={() => setFavourited((f) => !f)}
              active={favourited}
              iconFill
            />
          </TutorialTarget>
          <TutorialTarget id="counter.plus">
            <ActionPill Icon={Plus} onPress={incrementCurrent} />
          </TutorialTarget>
        </View>
      </View>

      <InfoModal
        visible={infoOpen}
        description={dhikr.description}
        reference={dhikr.reference}
        grade={dhikr.grade}
        onClose={() => setInfoOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
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
    paddingHorizontal: 0,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  tileRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  arrowLeft: {
    position: 'absolute',
    left: 12,
    top: 0,
  },
  arrowRight: {
    position: 'absolute',
    right: 12,
    top: 0,
  },
  tileWrap: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    position: 'relative',
  },
  tilePressable: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
  },
  countSlot: {
    position: 'absolute',
    top: TILE_HEIGHT * 0.07,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  cornerLeft: {
    position: 'absolute',
    top: TILE_HEIGHT * 0.24,
    left: 24,
    zIndex: 2,
  },
  cornerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerLeftBorder: {
    borderWidth: 1,
    borderRadius: 17,
  },
  cornerRight: {
    position: 'absolute',
    top: TILE_HEIGHT * 0.24,
    right: 24,
    zIndex: 2,
  },
  pagerSlot: {
    position: 'absolute',
    top: TILE_HEIGHT * 0.28,
    left: 0,
    right: 0,
    bottom: TILE_HEIGHT * 0.08,
    justifyContent: 'center',
  },
  pagerTarget: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 12,
    paddingHorizontal: 16,
  },
});
