import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import type { HintKind, Rect } from '@/context/TutorialContext';

interface Props {
  kind: HintKind;
  rect: Rect;
}

export function GestureHint({ kind, rect }: Props) {
  if (!kind) return null;
  if (kind === 'tap' || kind === 'longPress') {
    return <TapHint rect={rect} long={kind === 'longPress'} />;
  }
  if (kind === 'swipeH') return <SwipeHint rect={rect} axis="x" />;
  return <SwipeHint rect={rect} axis="y" />;
}

function TapHint({ rect, long }: { rect: Rect; long: boolean }) {
  const { palette } = useTheme();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withRepeat(
      withSequence(
        withTiming(1, { duration: long ? 2400 : 1400, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, [t, long]);

  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const SIZE = 84;

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.1, 1], [0, 0.85, 0]),
    transform: [{ scale: interpolate(t.value, [0, 1], [0.4, 1.6]) }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.15, 0.55, 1], [0, 1, 1, 0]),
    transform: [{ scale: interpolate(t.value, [0, 0.2, 1], [0.6, 1, 0.85]) }],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.tapRing,
          {
            top: cy - SIZE / 2,
            left: cx - SIZE / 2,
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderColor: palette.accent,
          },
          ringStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.tapDot,
          {
            top: cy - 14,
            left: cx - 14,
            backgroundColor: palette.accent,
            shadowColor: palette.accent,
          },
          dotStyle,
        ]}
      />
    </View>
  );
}

function SwipeHint({ rect, axis }: { rect: Rect; axis: 'x' | 'y' }) {
  const { palette } = useTheme();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = 0;
    t.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.cubic) }),
      -1,
      false,
    );
  }, [t]);

  const horizontal = axis === 'x';
  const length = horizontal ? rect.width * 0.7 : rect.height * 0.7;
  const thickness = 4;
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;

  const trackStyle = horizontal
    ? {
        top: cy - thickness / 2,
        left: cx - length / 2,
        width: length,
        height: thickness,
      }
    : {
        top: cy - length / 2,
        left: cx - thickness / 2,
        width: thickness,
        height: length,
      };

  const shimmerLen = length * 0.45;
  const travel = length;

  const shimmerStyle = useAnimatedStyle(() => {
    const offset = interpolate(t.value, [0, 1], [-shimmerLen, travel]);
    return horizontal
      ? { transform: [{ translateX: offset }] }
      : { transform: [{ translateY: offset }] };
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.track,
          trackStyle,
          { backgroundColor: palette.accentLight, borderRadius: thickness / 2 },
        ]}
      >
        <Animated.View
          style={[
            horizontal
              ? { width: shimmerLen, height: thickness, top: 0, left: 0, position: 'absolute' }
              : { width: thickness, height: shimmerLen, top: 0, left: 0, position: 'absolute' },
            shimmerStyle,
          ]}
        >
          <LinearGradient
            colors={['transparent', palette.accent, 'transparent']}
            start={horizontal ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 }}
            end={horizontal ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: thickness / 2 }]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tapRing: {
    position: 'absolute',
    borderWidth: 2.5,
  },
  tapDot: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  track: {
    position: 'absolute',
    overflow: 'hidden',
  },
});
