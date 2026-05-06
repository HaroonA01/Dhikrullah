import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

interface Heart {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  peakOpacity: number;
  colorIndex: number;
}

const LIGHT_COLORS = ['#C84060', '#D85070', '#E06080', '#B83058', '#CC4870'];
const DARK_COLORS  = ['#FF8098', '#FFAAB8', '#FF90A8', '#FF7090', '#FFB0C0'];

function buildHearts(count: number): Heart[] {
  let seed = 0xF1F5EED;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(seed) / 0x7fffffff;
  };
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: rand() * W,
    size: 10 + rand() * 18,
    duration: 6000 + rand() * 8000,
    delay: rand() * 12000,
    drift: (rand() - 0.5) * 80,
    peakOpacity: 0.22 + rand() * 0.30,
    colorIndex: Math.floor(rand() * 5),
  }));
}

function FloatingHeart({ heart, colors }: { heart: Heart; colors: string[] }) {
  const pos = useSharedValue(0);

  useEffect(() => {
    pos.value = withDelay(
      heart.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: heart.duration, easing: Easing.linear }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
      ),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const p = pos.value;
    const ty = -(p * H * 1.15);
    const tx = Math.sin(p * Math.PI * 3) * heart.drift;
    const opacity =
      p < 0.10 ? (p / 0.10) * heart.peakOpacity :
      p > 0.80 ? ((1 - p) / 0.20) * heart.peakOpacity :
      heart.peakOpacity;
    return { transform: [{ translateX: tx }, { translateY: ty }], opacity };
  });

  return (
    <Animated.Text
      style={[
        styles.heart,
        {
          left: heart.x,
          bottom: -heart.size,
          fontSize: heart.size,
          color: colors[heart.colorIndex],
        },
        style,
      ]}
    >
      ♥
    </Animated.Text>
  );
}

export function HeartField({ count = 20 }: { count?: number }) {
  const { palette } = useTheme();
  const hearts = useMemo(() => buildHearts(count), [count]);
  const colors = palette.scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {hearts.map(h => (
        <FloatingHeart key={h.id} heart={h} colors={colors} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  heart: {
    position: 'absolute',
  },
});
