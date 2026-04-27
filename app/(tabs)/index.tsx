import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
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
import { useDhikrContent } from '@/context/CounterContext';
import { usePrefs, usePrayerTimes } from '@/context/PrefsContext';
import { useTheme } from '@/context/ThemeContext';
import { CategoryCard } from '@/components/CategoryCard';
import { GradientBackground } from '@/components/GradientBackground';
import { SwipeChevron } from '@/components/SwipeChevron';
import { LocationPrompt } from '@/components/LocationPrompt';
import { useRandomQuote } from '@/hooks/useRandomQuote';
import { formatPrayerTime } from '@/lib/prayer';
import { requestDeviceLocation } from '@/lib/location';
import type { CategoryId } from '@/types';

const { height: SCREEN_H } = Dimensions.get('window');
const SPRING_EXPAND = { damping: 12, stiffness: 78, mass: 1.15 };
const SPRING_COLLAPSE = { damping: 10, stiffness: 120, mass: 1.1 };
const EXPAND_THRESHOLD = 0.38;
const COLLAPSE_THRESHOLD = 0.62;
const FLING_VELOCITY = 1400;

const PRAYER_IDS: ReadonlySet<CategoryId> = new Set([
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
]);

export default function Home() {
  const insets = useSafeAreaInsets();
  const quote = useRandomQuote();
  const { palette } = useTheme();
  const { categories } = useDhikrContent();
  const {
    hydrated: prefsHydrated,
    location,
    locationPromptShown,
    markLocationPromptShown,
    setLocation,
  } = usePrefs();
  const prayerTimes = usePrayerTimes();
  const tabBarH = 80;

  const [promptVisible, setPromptVisible] = useState(false);
  const promptTriggered = useRef(false);

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
      const flungDown = e.velocityY > FLING_VELOCITY;
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
                const time =
                  PRAYER_IDS.has(c.id) && prayerTimes
                    ? prayerTimes.get(c.id)
                    : null;
                const trailing = time ? (
                  <Text style={[styles.timeText, { color: palette.accent }]}>
                    {formatPrayerTime(time)}
                  </Text>
                ) : undefined;
                return (
                  <CategoryCard key={c.id} category={c} trailing={trailing} />
                );
              })}
            </Animated.ScrollView>
          </NativeViewGestureHandler>
        </Animated.View>

        <Animated.View
          style={[styles.headerWrap, { height: insets.top + 74 }, headerStyle]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[palette.bgTop, palette.bgTop, `${palette.bgTop}00`]}
            locations={[0, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.headerInner, { paddingTop: insets.top + 28 }]}>
            <Text style={[styles.headerGreeting, { color: palette.textDark }]}>
              As-Salamu Alaykum
            </Text>
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
      </View>
    </GestureDetector>
  );
}

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
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    fontVariant: ['tabular-nums'],
  },
});
