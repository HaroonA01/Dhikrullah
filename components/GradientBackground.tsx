import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { StarField } from '@/components/StarField';
import { HeartField } from '@/components/HeartField';
import { InfinityField } from '@/components/InfinityField';

export function GradientBackground() {
  const { palette, activeSpecialTheme, resolvedSpecialPalette } = useTheme();

  if (activeSpecialTheme && resolvedSpecialPalette) {
    const { gradientColors, gradientLocations } = resolvedSpecialPalette;
    return (
      <>
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          locations={gradientLocations as [number, number, ...number[]]}
          style={StyleSheet.absoluteFill}
        />
        {activeSpecialTheme.hasStars    && <StarField />}
        {activeSpecialTheme.hasHearts   && <HeartField />}
        {activeSpecialTheme.hasInfinity && <InfinityField />}
      </>
    );
  }

  return (
    <LinearGradient
      colors={[palette.bgTop, palette.bgMid, palette.bgBottom]}
      locations={[0, 0.5, 1]}
      style={StyleSheet.absoluteFill}
    />
  );
}
