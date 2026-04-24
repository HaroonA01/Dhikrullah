import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';
import { CategoryId } from '@/types';
import { getDhikrsFor } from '@/data/dhikrs';
import { CATEGORIES } from '@/data/categories';
import { useCounter } from '@/hooks/useCounter';
import { useFavourites } from '@/context/FavouritesContext';
import { DhikrPager } from '@/components/DhikrPager';
import { CountButton } from '@/components/CountButton';
import { BottomNavBar } from '@/components/BottomNavBar';
import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { ACCENT, TEXT_DARK, TEXT_MID, GLASS_BG, GLASS_BORDER } from '@/constants/theme';

export default function CounterScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const insets = useSafeAreaInsets();
  const categoryId = category as CategoryId;
  const meta = CATEGORIES.find(c => c.id === categoryId);
  const dhikrs = meta ? getDhikrsFor(categoryId) : [];
  const { hydrated, state, incrementCurrent, nextDhikr, resetAll } = useCounter(categoryId);
  const { toggle, isFavourite } = useFavourites();

  if (!meta) {
    return (
      <View style={styles.fallback}>
        <GradientBackground />
        <Text style={{ color: TEXT_MID }}>Unknown category: {String(category)}</Text>
      </View>
    );
  }

  if (!hydrated) {
    return (
      <View style={styles.fallback}>
        <GradientBackground />
        <Text style={{ color: TEXT_MID }}>Loading…</Text>
      </View>
    );
  }

  const currentDhikr = dhikrs[state.currentDhikrIndex];
  const count = currentDhikr ? state.counts[currentDhikr.id] ?? 0 : 0;
  const isLast = state.currentDhikrIndex >= dhikrs.length - 1;
  const finished = isLast && currentDhikr && count >= currentDhikr.target;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />
      <GradientBackground />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerWordmark}>Dhikrullah</Text>
        <Text style={styles.headerCategory}>{meta.label}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.progress}>
          {state.currentDhikrIndex + 1} / {dhikrs.length}
        </Text>

        {currentDhikr ? (
          <>
            <GlassCard style={styles.dhikrCard}>
              <Pressable
                onPress={() => toggle(currentDhikr.id)}
                style={styles.heartBtn}
                hitSlop={12}
              >
                <Heart
                  size={20}
                  color={ACCENT}
                  strokeWidth={1.5}
                  fill={isFavourite(currentDhikr.id) ? ACCENT : 'none'}
                />
              </Pressable>
              <DhikrPager dhikr={currentDhikr} />
            </GlassCard>

            <View style={{ height: 28 }} />

            <CountButton
              count={count}
              target={currentDhikr.target}
              onPress={incrementCurrent}
              disabled={finished ?? false}
            />

            <View style={styles.actions}>
              <Pressable
                onPress={nextDhikr}
                disabled={isLast}
                style={({ pressed }) => [
                  styles.action,
                  pressed && styles.actionPressed,
                  isLast && styles.actionDisabled,
                ]}
              >
                <Text style={styles.actionText}>Next dhikr</Text>
              </Pressable>
              <Pressable
                onPress={resetAll}
                style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
              >
                <Text style={styles.actionText}>Reset</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <Text style={{ color: TEXT_MID }}>No dhikrs in this category.</Text>
        )}
      </View>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerWordmark: {
    fontSize: 12,
    color: ACCENT,
    letterSpacing: 1.5,
    fontWeight: '600',
    opacity: 0.8,
  },
  headerCategory: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT_DARK,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dhikrCard: {
    paddingVertical: 8,
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  progress: {
    textAlign: 'center',
    color: TEXT_MID,
    marginBottom: 12,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  action: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  actionPressed: { opacity: 0.6 },
  actionDisabled: { opacity: 0.3 },
  actionText: { fontSize: 14, color: TEXT_DARK, fontWeight: '500' },
});
