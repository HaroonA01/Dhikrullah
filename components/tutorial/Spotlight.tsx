import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import type { Rect } from '@/context/TutorialContext';

interface Props {
  rect: Rect;
  padding?: number;
  radius?: number;
}

const DIM = 'rgba(0,0,0,0.45)';

export function Spotlight({ rect, padding = 8, radius = 14 }: Props) {
  const { palette } = useTheme();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = 0;
    pulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse, rect.x, rect.y, rect.width, rect.height]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + pulse.value * 0.45,
    transform: [{ scale: 1 + pulse.value * 0.04 }],
  }));

  const left = rect.x - padding;
  const top = rect.y - padding;
  const width = rect.width + padding * 2;
  const height = rect.height + padding * 2;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* top */}
      <View style={[styles.dim, { left: 0, right: 0, top: 0, height: Math.max(0, top) }]} />
      {/* bottom */}
      <View style={[styles.dim, { left: 0, right: 0, top: top + height, bottom: 0 }]} />
      {/* left */}
      <View style={[styles.dim, { top, height, left: 0, width: Math.max(0, left) }]} />
      {/* right */}
      <View style={[styles.dim, { top, height, left: left + width, right: 0 }]} />
      {/* ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            top,
            left,
            width,
            height,
            borderRadius: radius,
            borderColor: palette.accent,
            shadowColor: palette.accent,
          },
          ringStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
    backgroundColor: DIM,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
