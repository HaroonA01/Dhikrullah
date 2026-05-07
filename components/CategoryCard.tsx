import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Sun,
  Sunset,
  Sunrise,
  Clock,
  Hourglass,
  Compass,
  Star,
  Sparkles,
  Coffee,
  BedDouble,
  Wind,
} from 'lucide-react-native';
import { Category, CategoryId } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { CircleProgress } from '@/components/CircleProgress';


const SUBTITLES: Record<CategoryId, string> = {
  all_day: 'Anytime',
  waking_up: 'Upon awakening',
  morning: 'After Fajr prayer',
  evening: 'After Asr prayer',
  fajr: 'Dawn prayer',
  dhuhr: 'Midday prayer',
  asr: 'Afternoon prayer',
  maghrib: 'Sunset prayer',
  isha: 'Night prayer',
  witr: 'Night prayer supplication',
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
  fajr: Sunrise,
  dhuhr: Clock,
  asr: Hourglass,
  maghrib: Compass,
  isha: Star,
  witr: Wind,
  before_bed: BedDouble,
};

interface Props {
  category: Category;
  trailing?: React.ReactNode;
  timeRange?: string;
  progress?: number;
}

export function CategoryCard({ category, trailing, timeRange, progress }: Props) {
  const { palette } = useTheme();
  const subtitle = SUBTITLES[category.id];
  const Icon = ICONS[category.id];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: palette.glassBg },
        pressed && styles.pressed,
      ]}
      onPress={() => router.push(`/counter/${category.id}`)}
    >
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.borderOverlay,
          { borderColor: palette.glassBorder },
        ]}
      />
      {/* left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: palette.accent }]} />

      {/* left 75% — text + icon + arabic watermark */}
      <View style={styles.left}>
        <View style={styles.row}>
          <Icon size={20} color={palette.accent} strokeWidth={1.5} />
          <View style={styles.textBlock}>
            <Text style={[styles.label, { color: palette.textDark }]}>
              {category.label}
            </Text>
            {timeRange ? (
              <Text style={[styles.timeRange, { color: palette.accent }]}>
                {timeRange}
              </Text>
            ) : null}
            <Text style={[styles.subtitle, { color: palette.textMid }]}>
              {subtitle}
            </Text>
          </View>
        </View>
      </View>

      {/* right 25% — progress ring */}
      <View style={styles.right}>
        {progress !== undefined ? (
          <CircleProgress percent={progress} />
        ) : trailing ?? null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 84,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  borderOverlay: {
    borderWidth: 1,
    borderRadius: 16,
    zIndex: 1,
  },
  pressed: {
    opacity: 0.75,
  },
  accentBar: {
    width: 3,
    borderRadius: 2,
    marginRight: 0,
  },
  left: {
    flex: 3,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingLeft: 12,
    paddingRight: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  timeRange: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
    lineHeight: 15,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.7,
  },
  right: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
