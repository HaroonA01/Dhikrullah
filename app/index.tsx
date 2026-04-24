import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { DustChar } from '@/components/DustChar';
import { useRandomQuote } from '@/hooks/useRandomQuote';
import { ACCENT, TEXT_DARK, TEXT_MID } from '@/constants/theme';

// ── timing constants ────────────────────────────────────────────────
const APPEAR_DUR = 300;
const DISAPPEAR_DUR = 400;
const STAGGER = 60;
const DIS_STAGGER = 35;
const EN_START = 150;
const EN_N = 10; // "Dhikrullah"

// Last English letter fully in: 150 + 9*60 + 300 = 990
// Hold 350ms → EN_DISAPPEAR_START = 1340
const EN_DISAPPEAR_START = EN_START + (EN_N - 1) * STAGGER + APPEAR_DUR + 350;

// Last letter disappear ends: 1340 + 9*35 + 400 = 2055
// Particles drift ~750ms past fade → settled by ~2800
const AR_START = 2500;
const AR_APPEAR_DUR = 500;
const AR_HOLD = 500;
const AR_DISAPPEAR_DUR = 400;
// Arabic done: 2500 + 500 + 500 + 400 = 3900

const NAVIGATE_AT = 4000;

const ENGLISH_CHARS = 'Dhikrullah'.split('');
const ARABIC_TEXT = 'ذكر الله';

function navigate() {
  router.replace('/(tabs)');
}

export default function Loading() {
  const quote = useRandomQuote();
  const arabicOpacity = useSharedValue(0);
  const arabicTy = useSharedValue(14);
  const quoteOpacity = useSharedValue(0);

  useEffect(() => {
    quoteOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));

    arabicOpacity.value = withDelay(
      AR_START,
      withSequence(
        withTiming(1, { duration: AR_APPEAR_DUR }),
        withDelay(AR_HOLD, withTiming(0, { duration: AR_DISAPPEAR_DUR }))
      )
    );
    arabicTy.value = withDelay(
      AR_START,
      withSequence(
        withTiming(0, { duration: AR_APPEAR_DUR }),
        withDelay(AR_HOLD, withTiming(-20, { duration: AR_DISAPPEAR_DUR }))
      )
    );

    const timer = setTimeout(() => navigate(), NAVIGATE_AT);
    return () => clearTimeout(timer);
  }, []);

  const arabicStyle = useAnimatedStyle(() => ({
    opacity: arabicOpacity.value,
    transform: [{ translateY: arabicTy.value }],
  }));

  const quoteStyle = useAnimatedStyle(() => ({ opacity: quoteOpacity.value }));

  return (
    <View style={styles.wrap}>
      <GradientBackground />

      <View style={styles.inner}>
        <View style={styles.titleArea}>
          <View style={[styles.titleRow, StyleSheet.absoluteFillObject]}>
            {ENGLISH_CHARS.map((char, i) => {
              const appearDelay = EN_START + i * STAGGER;
              const disappearStart = EN_DISAPPEAR_START + i * DIS_STAGGER;
              const holdDur = disappearStart - (appearDelay + APPEAR_DUR);
              return (
                <DustChar
                  key={i}
                  char={char}
                  index={i}
                  appearDelay={appearDelay}
                  holdDur={holdDur}
                  disappearStart={disappearStart}
                />
              );
            })}
          </View>

          <Animated.Text style={[styles.arabic, StyleSheet.absoluteFillObject, arabicStyle]}>
            {ARABIC_TEXT}
          </Animated.Text>
        </View>

        <Animated.View style={[styles.quoteWrap, quoteStyle]}>
          <GlassCard style={styles.quoteCard}>
            <Text style={styles.quoteText}>&ldquo;{quote.text}&rdquo;</Text>
            {quote.source ? (
              <Text style={styles.quoteSource}>— {quote.source}</Text>
            ) : null}
          </GlassCard>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  inner: {
    width: '100%',
    alignItems: 'center',
  },
  titleArea: {
    height: 68,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabic: {
    fontSize: 32,
    fontWeight: '500',
    color: ACCENT,
    textAlign: 'center',
    includeFontPadding: false,
  },
  quoteWrap: {
    width: '100%',
  },
  quoteCard: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  quoteText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    color: TEXT_DARK,
    opacity: 0.85,
    fontStyle: 'italic',
  },
  quoteSource: {
    fontSize: 12,
    marginTop: 10,
    color: TEXT_MID,
    textAlign: 'center',
  },
});
