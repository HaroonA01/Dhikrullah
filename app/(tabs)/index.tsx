import { useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
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
import { CATEGORIES } from '@/data/categories';
import { CategoryCard } from '@/components/CategoryCard';
import { GradientBackground } from '@/components/GradientBackground';
import { SwipeChevron } from '@/components/SwipeChevron';
import { useRandomQuote } from '@/hooks/useRandomQuote';
import { ACCENT, BG_TOP, TEXT_DARK, TEXT_MID, TEXT_DIM } from '@/constants/theme';

const { height: SCREEN_H } = Dimensions.get('window');
// Smooth spring for collapse, bouncy spring for expand
const SPRING_EXPAND = { damping: 12, stiffness: 78, mass: 1.15 };
const SPRING_COLLAPSE = { damping: 10, stiffness: 120, mass: 1.1 };
// Spring-commit thresholds: require real pull before auto-completing, so list feels dragged up
const EXPAND_THRESHOLD = 0.38;
const COLLAPSE_THRESHOLD = 0.62;
const FLING_VELOCITY = 1400;

export default function Home() {
  const insets = useSafeAreaInsets();
  const quote = useRandomQuote();
  const tabBarH = 80;

  const progress = useSharedValue(0);
  const expandTarget = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const listHeight = useSharedValue(SCREEN_H);

  // NativeViewGestureHandler ref — required for simultaneousWithExternalGesture
  // to correctly coexist with the ScrollView's native scroll gesture
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
      // 1:1 finger tracking — progress reflects list pixel travel divided by list height
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
    // Linear 1:1 with progress — list climbs from screen bottom as finger drags up.
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
          <Text style={styles.greetingLine1}>As-Salamu</Text>
          <Text style={styles.greetingLine2}>Alaykum</Text>
        </Animated.View>

        <Animated.View
          style={[styles.quoteWrap, { top: SCREEN_H * 0.32 + insets.top + 130 }, quoteStyle]}
          pointerEvents="none"
        >
          <Text style={styles.quoteText}>&ldquo;{quote.text}&rdquo;</Text>
          {quote.source ? (
            <Text style={styles.quoteSource}>— {quote.source}</Text>
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
              {CATEGORIES.map((c) => (
                <CategoryCard key={c.id} category={c} />
              ))}
            </Animated.ScrollView>
          </NativeViewGestureHandler>
        </Animated.View>

        <Animated.View
          style={[styles.headerWrap, { height: insets.top + 74 }, headerStyle]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[BG_TOP, BG_TOP, 'rgba(212,232,212,0)']}
            locations={[0, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.headerInner, { paddingTop: insets.top + 28 }]}>
            <Text style={styles.headerGreeting}>As-Salamu Alaykum</Text>
            <Text style={styles.headerSub}>Dhikrullah</Text>
          </View>
        </Animated.View>

        <SwipeChevron progress={progress} bottomOffset={tabBarH} />
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
    color: TEXT_DARK,
    letterSpacing: -0.5,
    lineHeight: 52,
    textAlign: 'center',
  },
  greetingLine2: {
    fontSize: 46,
    fontWeight: '700',
    color: ACCENT,
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
    color: TEXT_MID,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quoteSource: {
    fontSize: 11,
    color: TEXT_DIM,
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
    color: TEXT_DARK,
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 12,
    color: ACCENT,
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
