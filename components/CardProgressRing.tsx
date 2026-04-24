import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ACCENT, GLASS_BORDER } from '@/constants/theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface Props {
  percent: number;
  width: number;
  height: number;
  radius?: number;
  stroke?: number;
}

function roundedRectPerimeter(w: number, h: number, r: number): number {
  const clampedR = Math.min(r, Math.min(w, h) / 2);
  return 2 * (w - 2 * clampedR) + 2 * (h - 2 * clampedR) + 2 * Math.PI * clampedR;
}

export function CardProgressRing({
  percent,
  width,
  height,
  radius = 16,
  stroke = 3,
}: Props) {
  const perimeter = useMemo(
    () => roundedRectPerimeter(width - stroke, height - stroke, radius),
    [width, height, radius, stroke],
  );

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(Math.max(0, Math.min(100, percent)), {
      damping: 18,
      stiffness: 90,
      mass: 0.9,
    });
  }, [percent, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: perimeter * (1 - progress.value / 100),
  }));

  if (width <= 0 || height <= 0) return null;

  const rectProps = {
    x: stroke / 2,
    y: stroke / 2,
    width: width - stroke,
    height: height - stroke,
    rx: radius,
    ry: radius,
    fill: 'transparent',
  };

  return (
    <View pointerEvents="none" style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height}>
        <Rect
          {...rectProps}
          stroke={GLASS_BORDER}
          strokeWidth={stroke}
        />
        <AnimatedRect
          {...rectProps}
          stroke={ACCENT}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${perimeter} ${perimeter}`}
          animatedProps={animatedProps}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
