import { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check } from 'lucide-react-native';
import type { Category } from '@/types';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  categories: Category[];
  weekDates: string[];
  todayKey: string;
  percents: Map<string, number>;
}

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const WEEKDAY_NAMES_LONG = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const LABEL_COL_WIDTH = 92;
const CELL_GAP = 4;
const CELL_MAX = 28;
const CELL_MIN = 18;

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDetailDate(key: string, weekdayIndex: number): string {
  const d = parseDateKey(key);
  return `${WEEKDAY_NAMES_LONG[weekdayIndex]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

function alphaHex(alpha: number): string {
  return Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
}

function tintForPercent(percent: number, accent: string): string | null {
  if (percent <= 0) return null;
  if (percent >= 100) return accent;
  const min = 0.12;
  const max = 0.95;
  const alpha = min + (max - min) * (percent / 100);
  return `${accent}${alphaHex(alpha)}`;
}

export function CategoryHeatmap({
  categories,
  weekDates,
  todayKey,
  percents,
}: Props) {
  const { palette } = useTheme();
  const [cardWidth, setCardWidth] = useState(0);
  const [selected, setSelected] = useState<{
    categoryId: string;
    categoryLabel: string;
    date: string;
    weekdayIndex: number;
    percent: number;
  } | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== cardWidth) setCardWidth(w);
  };

  const cellSize = useMemo(() => {
    if (cardWidth <= 0) return CELL_MIN;
    const available = cardWidth - LABEL_COL_WIDTH - CELL_GAP * 7;
    const raw = available / 7;
    return Math.max(CELL_MIN, Math.min(CELL_MAX, Math.floor(raw)));
  }, [cardWidth]);

  const todayIndex = weekDates.indexOf(todayKey);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  const detailText = useMemo(() => {
    if (!selected) return 'Tap a cell for details';
    const dateLabel = formatDetailDate(selected.date, selected.weekdayIndex);
    if (selected.percent <= 0) return `${selected.categoryLabel} · ${dateLabel} — Not started`;
    if (selected.percent >= 100)
      return `${selected.categoryLabel} · ${dateLabel} — Completed`;
    return `${selected.categoryLabel} · ${dateLabel} — ${selected.percent}% complete`;
  }, [selected]);

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.textDark }]}>This Week</Text>
        <Text style={[styles.subtitle, { color: palette.textMid }]}>
          Category progress
        </Text>
      </View>

      <View style={styles.grid} onLayout={onLayout}>
        <View style={styles.headerRow}>
          <View style={{ width: LABEL_COL_WIDTH }} />
          {WEEKDAY_LABELS.map((lbl, i) => {
            const isToday = i === todayIndex;
            return (
              <View
                key={i}
                style={[
                  styles.weekdayCell,
                  { width: cellSize, marginLeft: CELL_GAP },
                ]}
              >
                <Text
                  style={[
                    styles.weekdayText,
                    { color: isToday ? palette.accent : palette.textDark },
                  ]}
                >
                  {lbl}
                </Text>
              </View>
            );
          })}
        </View>

        {sortedCategories.map((cat) => (
          <View key={cat.id} style={styles.row}>
            <Text
              style={[styles.rowLabel, { color: palette.textMid }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {cat.label}
            </Text>
            {weekDates.map((date, i) => {
              const key = `${date}|${cat.id}`;
              const percent = percents.get(key) ?? 0;
              const tint = tintForPercent(percent, palette.accent);
              const isComplete = percent >= 100;
              const isFuture = date > todayKey;
              const isSelected =
                selected?.categoryId === cat.id && selected.date === date;

              return (
                <Pressable
                  key={i}
                  disabled={isFuture}
                  onPress={() =>
                    setSelected({
                      categoryId: cat.id,
                      categoryLabel: cat.label,
                      date,
                      weekdayIndex: i,
                      percent,
                    })
                  }
                  style={({ pressed }) => [
                    styles.cellBase,
                    {
                      width: cellSize,
                      height: cellSize,
                      marginLeft: CELL_GAP,
                    },
                    tint
                      ? { backgroundColor: tint }
                      : {
                          backgroundColor: 'transparent',
                          borderWidth: 1,
                          borderColor: palette.glassBorder,
                        },
                    isSelected && {
                      borderWidth: 2,
                      borderColor: palette.accent,
                    },
                    pressed && !isFuture && styles.cellPressed,
                  ]}
                >
                  {isComplete ? (
                    <Check
                      size={Math.max(10, cellSize - 12)}
                      color="#FFFFFF"
                      strokeWidth={3}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={[styles.detail, { color: palette.textDim }]}>{detailText}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  grid: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  weekdayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CELL_GAP,
  },
  rowLabel: {
    width: LABEL_COL_WIDTH,
    paddingRight: 8,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '600',
  },
  cellBase: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellPressed: {
    opacity: 0.7,
  },
  detail: {
    marginTop: 12,
    fontSize: 11,
    textAlign: 'center',
  },
});
