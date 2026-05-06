import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  cycleDuration: number;  // full idle+flash cycle length
  color: string;
}

// pure white + cool blue-white + warm lilac-white — all pop against navy/plum
const STAR_COLORS = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#E8EEFF', '#F0E8FF', '#D8E8FF'];

function buildStars(count: number): Star[] {
  let seed = 0x5EAD5EED;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(seed) / 0x7fffffff;
  };
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: rand() * 100,
      // most stars in upper 50% (darkest part of sky), a few lower
      y: i % 6 === 0 ? 50 + rand() * 25 : rand() * 50,
      size: 0.5 + rand() * 1.6,
      delay: rand() * 5000,
      cycleDuration: 3000 + rand() * 4500,
      color: STAR_COLORS[Math.floor(rand() * STAR_COLORS.length)],
    });
  }
  return stars;
}

function StarDot({ star }: { star: Star }) {
  const opacity = useSharedValue(0.08);

  useEffect(() => {
    const idleTime = star.cycleDuration * 0.65;
    const riseTime = 180;
    const holdTime = 80;
    const fallTime = 420;
    // idle dim → quick flash bright → brief hold → slow fade back to dim
    opacity.value = withDelay(
      star.delay,
      withRepeat(
        withSequence(
          withTiming(0.07, { duration: idleTime, easing: Easing.linear }),
          withTiming(0.88, { duration: riseTime, easing: Easing.out(Easing.quad) }),
          withTiming(0.72, { duration: holdTime }),
          withTiming(0.07, { duration: fallTime, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.dot,
        animStyle,
        {
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          backgroundColor: star.color,
        },
      ]}
    />
  );
}

export function StarField({ count = 55 }: { count?: number }) {
  const stars = useMemo(() => buildStars(count), [count]);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map(s => (
        <StarDot key={s.id} star={s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
  },
});
