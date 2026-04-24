import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ACCENT, GLASS_BG, GLASS_BORDER, TEXT_MID } from '@/constants/theme';

interface Props {
  percent: number;
  completed?: number;
  total?: number;
}

export function ProgressBar({ percent, completed, total }: Props) {
  const progress = useSharedValue(percent);

  useEffect(() => {
    progress.value = withSpring(percent, { damping: 18, stiffness: 90, mass: 0.9 });
  }, [percent, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(100, progress.value))}%`,
  }));

  const showCounts = completed !== undefined && total !== undefined;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <View style={styles.labelRow}>
        <Text style={styles.labelLeft}>
          {showCounts ? `${completed} / ${total}` : ''}
        </Text>
        <Text style={styles.labelRight}>{Math.round(percent)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  track: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  labelLeft: {
    fontSize: 11,
    color: TEXT_MID,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  labelRight: {
    fontSize: 12,
    color: TEXT_MID,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
