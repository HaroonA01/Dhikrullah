import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { ChevronUp } from 'lucide-react-native';
import { TEXT_DIM, ACCENT } from '@/constants/theme';

interface Props {
  progress: SharedValue<number>;
  bottomOffset: number;
}

export function SwipeChevron({ progress, bottomOffset }: Props) {
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-9, { duration: 550 }),
        withTiming(0, { duration: 550 }),
      ),
      -1,
      false,
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.35], [1, 0]),
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, { bottom: bottomOffset + 16 }, containerStyle]}>
      <ChevronUp size={22} color={ACCENT} strokeWidth={2} />
      <Text style={styles.label}>swipe up</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: TEXT_DIM,
    letterSpacing: 1,
  },
});
