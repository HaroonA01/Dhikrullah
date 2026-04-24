import { ComponentType } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LucideProps } from 'lucide-react-native';
import { ACCENT, GLASS_BG, GLASS_BORDER } from '@/constants/theme';
import { hapticsLight } from '@/lib/haptics';

interface Props {
  Icon: ComponentType<LucideProps>;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
  iconFill?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionPill({
  Icon,
  onPress,
  disabled,
  active = false,
  iconFill = false,
}: Props) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const showFill = iconFill && active;

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: 70 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 220 });
      }}
      onPress={() => {
        if (disabled) return;
        hapticsLight();
        onPress();
      }}
      disabled={disabled}
      style={[styles.btn, disabled && styles.disabled, style]}
    >
      <Icon
        size={22}
        color={ACCENT}
        strokeWidth={2}
        fill={showFill ? ACCENT : 'none'}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  disabled: {
    opacity: 0.3,
  },
});
