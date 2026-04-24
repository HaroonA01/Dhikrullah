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
import { SharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector, NativeViewGestureHandler } from 'react-native-gesture-handler';
import { CATEGORIES } from '@/data/categories';
import { Category } from '@/types';
import { CategoryCard } from '@/components/CategoryCard';
import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { SwipeChevron } from '@/components/SwipeChevron';
import { useRandomQuote } from '@/hooks/useRandomQuote';
import { ACCENT, TEXT_DARK, TEXT_MID, TEXT_DIM } from '@/constants/theme';

const { height: SCREEN_H } = Dimensions.get('window');
// Smooth spring for collapse, bouncy spring for expand
const SPRING_EXPAND = { damping: 12, stiffness: 160 };
const SPRING_COLLAPSE = { damping: 20, stiffness: 130 };
const DRAG_DISTANCE = 260;

function CategoryRow({
  category,
  progress,
  index,
}: {
  category: Category;
  progress: SharedValue<number>;
  index: number;
}) {
  // Spread cards evenly across swipe: card 0 enters at 5%, card 7 at 61%
  const entryStart = 0.05 + index * 0.08;
  const entryEnd = Math.min(1, entryStart + 0.28);

  const style = useAnimatedStyle(() => {
    const raw = (progress.value - entryStart) / (entryEnd - entryStart);
    const p = Math.min(1, Math.max(0, raw));
    // Ease-out quad: fast launch, gentle landing
    const eased = p * (2 - p);
    return {
      opacity: Math.min(1, p * 4),       // fully opaque by 25% of entry window
      transform: [{ translateY: (1 - eased) * 110 }],  // 110px upward travel
    };
  });

  return (
    <Animated.View style={style}>
      <CategoryCard category={category} />
    </Animated.View>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const quote = useRandomQuote();
  const tabBarH = 80;

  const progress = useSharedValue(0);
  const expandTarget = useSharedValue(0);
  const scrollY = useSharedValue(0);

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
      if (expandTarget.value === 0) {
        // Collapsed → swiping up to expand
        progress.value = Math.min(1, Math.max(0, -e.translationY / DRAG_DISTANCE));
      } else if (scrollY.value <= 2) {
        // Expanded + at top of list → swiping down to collapse
        // translationY is POSITIVE when swiping down, so subtract to reduce progress
        progress.value = Math.min(1, Math.max(0, 1 - e.translationY / DRAG_DISTANCE));
      }
    })
    .onEnd(() => {
      const shouldExpand = progress.value > 0.5;
      expandTarget.value = shouldExpand ? 1 : 0;
      progress.value = withSpring(
        shouldExpand ? 1 : 0,
        shouldExpand ? SPRING_EXPAND : SPRING_COLLAPSE
      );
    });

  const greetingStart = SCREEN_H * 0.32 - insets.top;
  const greetingEnd = 8;

  const largeGreetingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.45], [1, 0]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -(greetingStart - greetingEnd)]) },
    ],
  }));

  const quoteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3], [1, 0]),
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.45, 1], [0, 1]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [16, 0]) }],
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
          <GlassCard style={styles.quoteCard}>
            <Text style={styles.quoteText}>&ldquo;{quote.text}&rdquo;</Text>
            {quote.source ? (
              <Text style={styles.quoteSource}>— {quote.source}</Text>
            ) : null}
          </GlassCard>
        </Animated.View>

        <Animated.View
          style={[styles.header, { paddingTop: insets.top + 10 }, headerStyle]}
          pointerEvents="none"
        >
          <Text style={styles.headerGreeting}>As-Salamu Alaykum</Text>
          <Text style={styles.headerSub}>Dhikrullah</Text>
        </Animated.View>

        <Animated.View style={[styles.categories, { paddingTop: insets.top + 76 }]}>
          <NativeViewGestureHandler ref={nativeRef}>
            <Animated.ScrollView
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              bounces={false}
              overScrollMode="never"
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            >
              {CATEGORIES.map((c, i) => (
                <CategoryRow key={c.id} category={c} progress={progress} index={i} />
              ))}
            </Animated.ScrollView>
          </NativeViewGestureHandler>
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
  },
  greetingLine2: {
    fontSize: 46,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: -0.5,
    lineHeight: 52,
  },
  quoteWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  quoteCard: {
    paddingHorizontal: 18,
    paddingVertical: 16,
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
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
