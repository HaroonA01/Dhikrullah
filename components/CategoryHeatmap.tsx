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
import { ACCENT, TEXT_DARK, TEXT_DIM, TEXT_MID } from '@/constants/theme';

interface Props {
  categories: Category[];
  weekDates: string[];
  todayKey: string;
  percents: Map<string, number>;
}

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const WEEKDAY_NAMES_LONG = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];

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

function tintForPercent(percent: number): string | null {
  if (percent <= 0) return null;
  if (percent >= 100) return ACCENT;
  const min = 0.12;
  const max = 0.95;
  const alpha = min + (max - min) * (percent / 100);
  return `rgba(45,106,79,${alpha.toFixed(3)})`;
}

export function CategoryHeatmap({
  categories,
  weekDates,
  todayKey,
  percents,
}: Props) {
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
        <Text style={styles.title}>This Week</Text>
        <Text style={styles.subtitle}>Category progress</Text>
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
                    isToday && styles.weekdayTextToday,
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
              style={styles.rowLabel}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {cat.label}
            </Text>
            {weekDates.map((date, i) => {
              const key = `${date}|${cat.id}`;
              const percent = percents.get(key) ?? 0;
              const tint = tintForPercent(percent);
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
                      : styles.cellEmpty,
                    isSelected && styles.cellSelected,
                    isFuture && styles.cellFuture,
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

      <Text style={styles.detail}>{detailText}</Text>
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
    color: TEXT_DARK,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    color: TEXT_MID,
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
    color: TEXT_DARK,
    letterSpacing: 0.5,
  },
  weekdayTextToday: {
    color: ACCENT,
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
    color: TEXT_MID,
    fontWeight: '600',
  },
  cellBase: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(26,26,46,0.13)',
  },
  cellFuture: {},
  cellSelected: {
    borderWidth: 2,
    borderColor: ACCENT,
  },
  cellPressed: {
    opacity: 0.7,
  },
  detail: {
    marginTop: 12,
    fontSize: 11,
    color: TEXT_DIM,
    textAlign: 'center',
  },
});
