import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { useRandomQuote } from '@/hooks/useRandomQuote';
import { ACCENT, TEXT_DARK, TEXT_MID } from '@/constants/theme';

// ── timing constants ────────────────────────────────────────────────
const APPEAR_DUR = 250;
const DISAPPEAR_DUR = 220;
const STAGGER = 50;
const DIS_STAGGER = 25;
const EN_START = 100;
const EN_N = 10; // "Dhikrullah"

// When all English letters are fully visible:
// lastLetterStart = EN_START + (EN_N-1)*STAGGER = 550
// lastLetterDone  = 550 + APPEAR_DUR = 800
// hold 350ms → EN_DISAPPEAR_START = 800 + 350 = 1150
const EN_DISAPPEAR_START = EN_START + (EN_N - 1) * STAGGER + APPEAR_DUR + 350;

// Last English letter disappear ends: 1150 + 9*25 + 220 = 1595
// Arabic starts at 1650 with longer appear + hold + disappear
const AR_START = 1650;
const AR_APPEAR_DUR = 400;
const AR_HOLD = 400;
const AR_DISAPPEAR_DUR = 300;
// Arabic done: 1650 + 400 + 400 + 300 = 2750

const NAVIGATE_AT = 2800;

const ENGLISH_CHARS = 'Dhikrullah'.split('');
const ARABIC_TEXT = 'ذكر الله';

function navigate() {
  router.replace('/(tabs)');
}

// Each English letter: rises in, holds, then drifts up and fades
function DustChar({ char, appearDelay, holdDur }: { char: string; appearDelay: number; holdDur: number }) {
  const opacity = useSharedValue(0);
  const ty = useSharedValue(14);

  useEffect(() => {
    opacity.value = withDelay(
      appearDelay,
      withSequence(
        withTiming(1, { duration: APPEAR_DUR }),
        withDelay(Math.max(0, holdDur), withTiming(0, { duration: DISAPPEAR_DUR }))
      )
    );
    ty.value = withDelay(
      appearDelay,
      withSequence(
        withTiming(0, { duration: APPEAR_DUR }),
        withDelay(Math.max(0, holdDur), withTiming(-18, { duration: DISAPPEAR_DUR }))
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  return <Animated.Text style={[styles.titleChar, style]}>{char}</Animated.Text>;
}

export default function Loading() {
  const quote = useRandomQuote();
  const arabicOpacity = useSharedValue(0);
  const arabicTy = useSharedValue(14);
  const quoteOpacity = useSharedValue(0);

  useEffect(() => {
    // Quote fades in gently after English settles
    quoteOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));

    // Arabic: rise in (green), hold, scatter upward and fade
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
        {/* Fixed-height title area — English and Arabic overlap here */}
        <View style={styles.titleArea}>
          {/* English: letter-by-letter dust */}
          <View style={[styles.titleRow, StyleSheet.absoluteFillObject]}>
            {ENGLISH_CHARS.map((char, i) => {
              const appearDelay = EN_START + i * STAGGER;
              const disappearStart = EN_DISAPPEAR_START + i * DIS_STAGGER;
              const holdDur = disappearStart - (appearDelay + APPEAR_DUR);
              return <DustChar key={i} char={char} appearDelay={appearDelay} holdDur={holdDur} />;
            })}
          </View>

          {/* Arabic: whole-string dust (avoids ligature breakage) */}
          <Animated.Text style={[styles.arabic, StyleSheet.absoluteFillObject, arabicStyle]}>
            {ARABIC_TEXT}
          </Animated.Text>
        </View>

        {/* Quote below — fades in after English settles */}
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
  titleChar: {
    fontSize: 44,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: 1,
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
