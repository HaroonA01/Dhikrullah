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

interface InfinityConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  rotateDuration: number;
  breatheDuration: number;
  driftAmount: number;
  driftDuration: number;
  peakOpacity: number;
  dimOpacity: number;
  delay: number;
}

function buildSymbols(count: number): InfinityConfig[] {
  let seed = 0xA1B2C3D4;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(seed) / 0x7fffffff;
  };
  return Array.from({ length: count }, (_, id) => {
    const size = 20 + rand() * 70;
    const tier = size > 60 ? 'large' : size > 38 ? 'medium' : 'small';
    return {
      id,
      x: rand() * W,
      y: rand() * H * 0.85,
      size,
      rotateDuration: tier === 'large' ? 14000 + rand() * 8000
                    : tier === 'medium' ? 8000 + rand() * 5000
                    : 4000 + rand() * 3000,
      breatheDuration: 3000 + rand() * 3000,
      driftAmount: tier === 'large' ? 8 + rand() * 12
                 : tier === 'medium' ? 14 + rand() * 20
                 : 20 + rand() * 30,
      driftDuration: 4000 + rand() * 4000,
      peakOpacity: tier === 'large' ? 0.06 + rand() * 0.07
                 : tier === 'medium' ? 0.09 + rand() * 0.10
                 : 0.14 + rand() * 0.12,
      dimOpacity: tier === 'large' ? 0.02 + rand() * 0.03
                : tier === 'medium' ? 0.03 + rand() * 0.04
                : 0.05 + rand() * 0.06,
      delay: rand() * 5000,
    };
  });
}

function InfinitySymbol({ cfg, tint }: { cfg: InfinityConfig; tint: string }) {
  const rotate  = useSharedValue(0);
  const opacity = useSharedValue(cfg.dimOpacity);
  const drift   = useSharedValue(0);

  useEffect(() => {
    rotate.value = withDelay(
      cfg.delay,
      withRepeat(withTiming(360, { duration: cfg.rotateDuration, easing: Easing.linear }), -1),
    );
    opacity.value = withDelay(
      cfg.delay,
      withRepeat(
        withSequence(
          withTiming(cfg.peakOpacity, { duration: cfg.breatheDuration / 2, easing: Easing.inOut(Easing.quad) }),
          withTiming(cfg.dimOpacity,  { duration: cfg.breatheDuration / 2, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
    drift.value = withDelay(
      cfg.delay,
      withRepeat(
        withSequence(
          withTiming( cfg.driftAmount, { duration: cfg.driftDuration, easing: Easing.inOut(Easing.sin) }),
          withTiming(-cfg.driftAmount, { duration: cfg.driftDuration, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
      ),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: drift.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.Text
      style={[
        styles.symbol,
        { left: cfg.x, top: cfg.y, fontSize: cfg.size, color: tint },
        style,
      ]}
    >
      ∞
    </Animated.Text>
  );
}

export function InfinityField({ count = 12 }: { count?: number }) {
  const { palette } = useTheme();
  const symbols = useMemo(() => buildSymbols(count), [count]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {symbols.map(cfg => (
        <InfinitySymbol key={cfg.id} cfg={cfg} tint={palette.accent} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  symbol: {
    position: 'absolute',
    fontWeight: '100',
  },
});
