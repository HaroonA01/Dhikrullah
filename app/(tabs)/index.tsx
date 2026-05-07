import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, Keyboard, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, NativeViewGestureHandler } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useDhikrContent, useCounterContext } from '@/context/CounterContext';
import { usePrefs } from '@/context/PrefsContext';
import { useTheme } from '@/context/ThemeContext';
import { getSpecialTheme, resolveSpecialPalette } from '@/constants/themes';
import { CategoryCard } from '@/components/CategoryCard';
import { GradientBackground } from '@/components/GradientBackground';
import { SwipeChevron } from '@/components/SwipeChevron';
import { LocationPrompt } from '@/components/LocationPrompt';
import { useRandomQuote } from '@/hooks/useRandomQuote';
import {
  computeExtendedTimes,
  computeTomorrowFajr,
  computeCategoryWindows,
} from '@/lib/prayer';
import { requestDeviceLocation } from '@/lib/location';
import { homeEvents } from '@/lib/homeEvents';

const { height: SCREEN_H } = Dimensions.get('window');
const SPRING_EXPAND = { damping: 12, stiffness: 78, mass: 1.15 };
const SPRING_COLLAPSE = { damping: 10, stiffness: 120, mass: 1.1 };
const EXPAND_THRESHOLD = 0.38;
const COLLAPSE_THRESHOLD = 0.62;
const FLING_VELOCITY = 1400;

export default function Home() {
  const insets = useSafeAreaInsets();
  const quote = useRandomQuote();
  const { palette, unlockSpecialTheme, setActiveSpecialTheme } = useTheme();
  const { categories } = useDhikrContent();
  const { states, dhikrsByCategory } = useCounterContext();
  const {
    hydrated: prefsHydrated,
    location,
    locationPromptShown,
    markLocationPromptShown,
    setLocation,
    prayerMethodId,
    madhab,
    wakingUpMinutes,
    beforeBedMinutes,
  } = usePrefs();
  const tabBarH = 80;

  const categoryPercents = useMemo(() => {
    const result: Record<string, number> = {};
    for (const cat of categories) {
      const list = dhikrsByCategory[cat.id] ?? [];
      const state = states[cat.id];
      if (!state || list.length === 0) { result[cat.id] = 0; continue; }
      let total = 0, done = 0;
      for (const d of list) {
        total += d.target;
        done += Math.min(state.counts[d.id] ?? 0, d.target);
      }
      result[cat.id] = total > 0 ? (done / total) * 100 : 0;
    }
    return result;
  }, [categories, dhikrsByCategory, states]);

  const categoryWindows = useMemo(() => {
    if (!location) return null;
    const now = new Date();
    const ext = computeExtendedTimes(location, now, prayerMethodId, madhab);
    const tomorrowFajr = computeTomorrowFajr(location, now, prayerMethodId, madhab);
    return computeCategoryWindows(ext, tomorrowFajr, wakingUpMinutes, beforeBedMinutes);
  }, [location, prayerMethodId, madhab, wakingUpMinutes, beforeBedMinutes]);

  const [promptVisible, setPromptVisible] = useState(false);
  const promptTriggered = useRef(false);

  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const eggTapCount = useRef(0);
  const eggTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEasterEggTap = useCallback(() => {
    eggTapCount.current += 1;
    if (eggTimer.current) clearTimeout(eggTimer.current);
    if (eggTapCount.current >= 10) {
      eggTapCount.current = 0;
      eggTimer.current = null;
      setCodeModalVisible(true);
      return;
    }
    eggTimer.current = setTimeout(() => {
      eggTapCount.current = 0;
      eggTimer.current = null;
    }, 3000);
  }, []);

  const handleEasterEggSuccess = useCallback((themeId: string) => {
    unlockSpecialTheme(themeId);
    setActiveSpecialTheme(themeId);
    setCodeModalVisible(false);
  }, [unlockSpecialTheme, setActiveSpecialTheme]);

  useEffect(() => {
    if (!prefsHydrated) return;
    if (promptTriggered.current) return;
    if (location || locationPromptShown) return;
    promptTriggered.current = true;
    setPromptVisible(true);
  }, [prefsHydrated, location, locationPromptShown]);

  const handleAllow = async () => {
    setPromptVisible(false);
    markLocationPromptShown();
    const result = await requestDeviceLocation();
    if (result) {
      setLocation(result);
    } else {
      Alert.alert(
        'Location unavailable',
        'You can set your location anytime from Settings → Prayer Times.',
      );
    }
  };

  const handleSkip = () => {
    setPromptVisible(false);
    markLocationPromptShown();
  };

  const progress = useSharedValue(0);
  const expandTarget = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const listHeight = useSharedValue(SCREEN_H);

  useEffect(() => {
    homeEvents.register(() => {
      expandTarget.value = 0;
      progress.value = withSpring(0, SPRING_COLLAPSE);
    });
    return () => homeEvents.unregister();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nativeRef = useRef<any>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: e => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const pan = Gesture.Pan()
    .activeOffsetY([-6, 6])
    .simultaneousWithExternalGesture(nativeRef)
    .onUpdate(e => {
      const dist = listHeight.value > 0 ? listHeight.value : SCREEN_H;
      if (expandTarget.value === 0) {
        progress.value = Math.min(1, Math.max(0, -e.translationY / dist));
      } else if (scrollY.value <= 2) {
        progress.value = Math.min(1, Math.max(0, 1 - e.translationY / dist));
      }
    })
    .onEnd(e => {
      const wasExpanded = expandTarget.value === 1;
      const flungUp = e.velocityY < -FLING_VELOCITY;
      const flungDown = e.velocityY > FLING_VELOCITY && scrollY.value <= 2;
      let shouldExpand: boolean;
      if (flungUp) shouldExpand = true;
      else if (flungDown) shouldExpand = false;
      else
        shouldExpand = wasExpanded
          ? progress.value > COLLAPSE_THRESHOLD
          : progress.value > EXPAND_THRESHOLD;
      expandTarget.value = shouldExpand ? 1 : 0;
      progress.value = withSpring(
        shouldExpand ? 1 : 0,
        shouldExpand ? SPRING_EXPAND : SPRING_COLLAPSE
      );
    });

  const greetingStart = SCREEN_H * 0.32 - insets.top;
  const greetingEnd = 8;

  const largeGreetingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.18], [1, 0]),
    transform: [
      { translateY: interpolate(progress.value, [0, 0.4], [0, -(greetingStart - greetingEnd)]) },
    ],
  }));

  const quoteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.12], [1, 0]),
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.18, 0.4], [0, 1]),
    transform: [{ translateY: interpolate(progress.value, [0, 0.4], [16, 0]) }],
  }));

  const listSlideStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [listHeight.value, 0]) },
    ],
    opacity: interpolate(progress.value, [0, 0.02, 1], [0, 1, 1]),
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.wrap}>
        <GradientBackground />

        <Animated.View
          style={[styles.largeGreeting, { top: SCREEN_H * 0.32 + insets.top }, largeGreetingStyle]}
          pointerEvents="none"
        >
          <Text style={[styles.greetingLine1, { color: palette.textDark }]}>
            As-Salamu
          </Text>
          <Text style={[styles.greetingLine2, { color: palette.accent }]}>
            Alaykum
          </Text>
        </Animated.View>

        <Animated.View
          style={[styles.quoteWrap, { top: SCREEN_H * 0.32 + insets.top + 130 }, quoteStyle]}
          pointerEvents="none"
        >
          <Text style={[styles.quoteText, { color: palette.textMid }]}>
            &ldquo;{quote.text}&rdquo;
          </Text>
          {quote.source ? (
            <Text style={[styles.quoteSource, { color: palette.textDim }]}>
              — {quote.source}
            </Text>
          ) : null}
        </Animated.View>

        <Animated.View
          style={[styles.categories, { paddingTop: insets.top + 84 }, listSlideStyle]}
          onLayout={(e) => {
            listHeight.value = e.nativeEvent.layout.height;
          }}
        >
          <NativeViewGestureHandler ref={nativeRef}>
            <Animated.ScrollView
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              bounces
              alwaysBounceVertical={false}
              overScrollMode="always"
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            >
              {categories.map((c) => {
                const win = categoryWindows?.[c.id];
                const timeRange = win
                  ? `${win.startLabel} – ${win.endLabel}`
                  : undefined;
                const pct = categoryPercents[c.id] ?? 0;
                return (
                  <CategoryCard
                    key={c.id}
                    category={c}
                    timeRange={timeRange}
                    progress={pct}
                  />
                );
              })}
            </Animated.ScrollView>
          </NativeViewGestureHandler>
        </Animated.View>

        <Animated.View
          style={[styles.headerWrap, { height: insets.top + 74 }, headerStyle]}
          pointerEvents="box-none"
        >
          <LinearGradient
            colors={[palette.bgTop, palette.bgTop, `${palette.bgTop}00`]}
            locations={[0, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.headerInner, { paddingTop: insets.top + 28 }]}>
            <Pressable onPress={handleEasterEggTap} hitSlop={12}>
              <Text style={[styles.headerGreeting, { color: palette.textDark }]}>
                As-Salamu Alaykum
              </Text>
            </Pressable>
            <Text style={[styles.headerSub, { color: palette.accent }]}>
              Dhikrullah
            </Text>
          </View>
        </Animated.View>

        <SwipeChevron progress={progress} bottomOffset={tabBarH} />

        <LocationPrompt
          visible={promptVisible}
          onAllow={handleAllow}
          onSkip={handleSkip}
        />

        <EasterEggModal
          visible={codeModalVisible}
          onClose={() => setCodeModalVisible(false)}
          onSuccess={handleEasterEggSuccess}
        />
      </View>
    </GestureDetector>
  );
}

// ─── Easter Egg Modal ──────────────────────────────────────────────────────

interface EggModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (themeId: string) => void;
}

function EasterEggModal({ visible, onClose, onSuccess }: EggModalProps) {
  const { palette, isDark } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [kbOffset, setKbOffset] = useState(0);
  const [successId, setSuccessId] = useState<string | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
      setCode('');
      setError(false);
      setSuccessId(null);
      if (successTimer.current) clearTimeout(successTimer.current);
    }
  }, [visible]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (e) => {
      setKbOffset(Math.min(e.endCoordinates.height * 0.5, 140));
    });
    const hide = Keyboard.addListener(hideEvent, () => setKbOffset(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const handleSubmit = () => {
    const trimmed = code.trim();
    let matched: string | null = null;
    if (trimmed.toLowerCase() === 'arabian night') matched = 'arabian-night';
    else if (trimmed === 'ليلة العربيا' || trimmed.toLowerCase() === 'laylatun arabia') matched = 'laylat-arabia';
    else if (trimmed.toLowerCase() === 'fifty six') matched = 'fifty-six';
    else if (trimmed.toLowerCase() === 'i love you always and forever') matched = 'always-forever';

    if (matched) {
      setSuccessId(matched);
      successTimer.current = setTimeout(() => onSuccess(matched!), 1600);
    } else {
      setError(true);
    }
  };

  const successTheme = successId ? getSpecialTheme(successId) : null;
  const sp = successTheme ? resolveSpecialPalette(successTheme, isDark) : null;
  const cardBg    = sp?.gradientColors[0]  ?? palette.bgTop;
  const cardBorder = sp?.glassBorder       ?? palette.glassBorder;
  const accent    = sp?.accent             ?? palette.accent;
  const textMid   = sp?.textMid            ?? palette.textMid;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={successId ? undefined : onClose}>
      <Pressable style={eggStyles.backdrop} onPress={successId ? undefined : onClose}>
        <Pressable
          style={[
            eggStyles.card,
            { backgroundColor: cardBg, borderColor: cardBorder, transform: [{ translateY: successId ? 0 : -kbOffset }] },
          ]}
          onPress={() => {}}
        >
          <Text style={[eggStyles.decorTL, { color: accent }]}>✦</Text>
          <Text style={[eggStyles.decorBR, { color: accent }]}>☽</Text>

          {successId ? (
            <>
              <Text style={[eggStyles.title, { color: accent }]}>
                ✦ {successTheme?.name} Unlocked
              </Text>
              <Text style={[eggStyles.subtitle, { color: textMid }]}>
                A hidden theme has been revealed. Find it in Settings under Appearance.
              </Text>
            </>
          ) : (
            <>
              <Text style={[eggStyles.title, { color: palette.accent }]}>Enter the Secret</Text>
              <Text style={[eggStyles.subtitle, { color: palette.textMid }]}>
                A hidden theme awaits those who know its name…
              </Text>
              <TextInput
                value={code}
                onChangeText={(t) => { setCode(t); setError(false); }}
                placeholder="Type the name…"
                placeholderTextColor={palette.textDim}
                style={[
                  eggStyles.input,
                  {
                    borderColor: error ? '#FF6B6B' : palette.glassBorder,
                    color: palette.textDark,
                    backgroundColor: palette.glassBg,
                  },
                ]}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
              />
              {error && (
                <Text style={eggStyles.errorText}>That's not quite right…</Text>
              )}
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  eggStyles.btn,
                  { backgroundColor: palette.accent },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[eggStyles.btnText, { color: palette.bgTop }]}>Reveal</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const eggStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 32,
    width: '82%',
    borderWidth: 1,
  },
  decorTL: {
    position: 'absolute',
    top: 14,
    left: 16,
    fontSize: 18,
    opacity: 0.5,
  },
  decorBR: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    fontSize: 20,
    opacity: 0.4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 19,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 8,
  },
  errorText: {
    color: '#FF8080',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  largeGreeting: {
    position: 'absolute',
    left: 24,
    right: 24,
  },
  greetingLine1: {
    fontSize: 46,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 52,
    textAlign: 'center',
  },
  greetingLine2: {
    fontSize: 46,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 52,
    textAlign: 'center',
  },
  quoteWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
  },
  quoteText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quoteSource: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerInner: {
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 1,
    fontWeight: '600',
  },
  categories: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
});
