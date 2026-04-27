import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Sun,
  Sunset,
  Moon,
  Sunrise,
  Clock,
  Hourglass,
  Compass,
  Star,
  Sparkles,
  Coffee,
  BedDouble,
} from 'lucide-react-native';
import { Category, CategoryId } from '@/types';
import { useTheme } from '@/context/ThemeContext';

const ARABIC: Record<CategoryId, string> = {
  all_day: 'ك',
  waking_up: 'ي',
  morning: 'ص',
  evening: 'م',
  night: 'ن',
  fajr: 'ف',
  dhuhr: 'ط',
  asr: 'ع',
  maghrib: 'غ',
  isha: 'ش',
  before_bed: 'ل',
};

const SUBTITLES: Record<CategoryId, string> = {
  all_day: 'Anytime',
  waking_up: 'Upon awakening',
  morning: 'After Fajr prayer',
  evening: 'After Asr prayer',
  night: 'Before sleep',
  fajr: 'Dawn prayer',
  dhuhr: 'Midday prayer',
  asr: 'Afternoon prayer',
  maghrib: 'Sunset prayer',
  isha: 'Night prayer',
  before_bed: 'Sleeping dua',
};

const ICONS: Record<
  CategoryId,
  React.ComponentType<{ size: number; color: string; strokeWidth: number }>
> = {
  all_day: Sparkles,
  waking_up: Coffee,
  morning: Sun,
  evening: Sunset,
  night: Moon,
  fajr: Sunrise,
  dhuhr: Clock,
  asr: Hourglass,
  maghrib: Compass,
  isha: Star,
  before_bed: BedDouble,
};

interface Props {
  category: Category;
  trailing?: React.ReactNode;
}

export function CategoryCard({ category, trailing }: Props) {
  const { palette } = useTheme();
  const arabic = ARABIC[category.id];
  const subtitle = SUBTITLES[category.id];
  const Icon = ICONS[category.id];

  const watermarkColor = `${palette.accent}14`; // ~8% alpha

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: palette.glassBg,
          borderColor: palette.glassBorder,
        },
        pressed && styles.pressed,
      ]}
      onPress={() => router.push(`/counter/${category.id}`)}
    >
      <Text
        style={[
          styles.arabicWatermark,
          { color: watermarkColor, right: trailing ? 80 : 16 },
        ]}
        numberOfLines={1}
      >
        {arabic}
      </Text>

      <View style={[styles.accentBar, { backgroundColor: palette.accent }]} />

      <View style={styles.content}>
        <Icon size={20} color={palette.accent} strokeWidth={1.5} />
        <View style={styles.textBlock}>
          <Text style={[styles.label, { color: palette.textDark }]}>
            {category.label}
          </Text>
          <Text style={[styles.subtitle, { color: palette.textMid }]}>
            {subtitle}
          </Text>
        </View>
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 76,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.75,
  },
  arabicWatermark: {
    position: 'absolute',
    fontSize: 58,
    fontWeight: '700',
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    paddingRight: 16,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  trailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 56,
  },
});
