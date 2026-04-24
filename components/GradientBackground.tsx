import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BG_TOP, BG_MID, BG_BOTTOM } from '@/constants/theme';

export function GradientBackground() {
  return (
    <LinearGradient
      colors={[BG_TOP, BG_MID, BG_BOTTOM]}
      locations={[0, 0.5, 1]}
      style={StyleSheet.absoluteFill}
    />
  );
}
