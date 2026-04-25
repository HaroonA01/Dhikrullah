import { useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GlassCard } from '@/components/GlassCard';
import {
  ACCENT,
  ACCENT_LIGHT,
  GLASS_BORDER,
  TEXT_DARK,
  TEXT_DIM,
  TEXT_MID,
} from '@/constants/theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export type ChartRange = '7d' | '10d' | '6m';
export interface ChartDatum {
  date: string;
  value: number;
}

interface Props {
  title: string;
  data: ChartDatum[];
  range: ChartRange;
  onRangeChange: (r: ChartRange) => void;
}

const RANGE_ORDER: ChartRange[] = ['7d', '10d', '6m'];
const RANGE_LABELS: Record<ChartRange, string> = {
  '7d': '7D',
  '10d': '10D',
  '6m': '6M',
};

const CHART_HEIGHT = 150;
const TOP_PADDING = 12;
const BOTTOM_LABEL_AREA = 24;

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_ABBREV = [
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

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function labelFor(date: string, range: ChartRange): string {
  const d = parseDateKey(date);
  if (range === '7d') return WEEKDAY_LETTERS[d.getDay()];
  if (range === '10d') return String(d.getDate());
  return MONTH_ABBREV[d.getMonth()];
}

interface BarProps {
  x: number;
  width: number;
  value: number;
  maxValue: number;
  innerHeight: number;
  baseY: number;
}

function AnimatedBar({ x, width, value, maxValue, innerHeight, baseY }: BarProps) {
  const ratio = useSharedValue(0);

  useEffect(() => {
    const target = maxValue > 0 ? Math.max(0, value) / maxValue : 0;
    ratio.value = withTiming(target, { duration: 450 });
  }, [value, maxValue, ratio]);

  const animatedProps = useAnimatedProps(() => {
    const h = Math.max(2, ratio.value * innerHeight);
    return { height: h, y: baseY - h };
  });

  return (
    <AnimatedRect
      x={x}
      width={width}
      rx={3}
      ry={3}
      fill={ACCENT}
      animatedProps={animatedProps}
    />
  );
}

export function StatBarChart({ title, data, range, onRangeChange }: Props) {
  const [chartWidth, setChartWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== chartWidth) setChartWidth(w);
  };

  const maxValue = useMemo(
    () => data.reduce((m, d) => (d.value > m ? d.value : m), 0),
    [data],
  );

  const innerHeight = CHART_HEIGHT - TOP_PADDING - BOTTOM_LABEL_AREA;
  const baseY = TOP_PADDING + innerHeight;

  const barLayout = useMemo(() => {
    if (chartWidth <= 0 || data.length === 0) return [];
    const gapRatio = 0.4;
    const slot = chartWidth / data.length;
    const barW = slot * (1 - gapRatio);
    return data.map((_, i) => ({
      x: i * slot + (slot - barW) / 2,
      width: barW,
      slotCenter: i * slot + slot / 2,
    }));
  }, [chartWidth, data]);

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.toggle}>
          {RANGE_ORDER.map((r) => {
            const active = r === range;
            return (
              <Pressable
                key={r}
                onPress={() => onRangeChange(r)}
                style={({ pressed }) => [
                  styles.toggleBtn,
                  active && styles.toggleBtnActive,
                  pressed && !active && styles.toggleBtnPressed,
                ]}
                hitSlop={6}
              >
                <Text
                  style={[
                    styles.toggleText,
                    active && styles.toggleTextActive,
                  ]}
                >
                  {RANGE_LABELS[r]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.chartWrap} onLayout={onLayout}>
        {chartWidth > 0 && (
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            <Line
              x1={0}
              y1={baseY}
              x2={chartWidth}
              y2={baseY}
              stroke={GLASS_BORDER}
              strokeWidth={1}
            />
            {barLayout.map((b, i) => (
              <AnimatedBar
                key={data[i].date}
                x={b.x}
                width={b.width}
                value={data[i].value}
                maxValue={maxValue}
                innerHeight={innerHeight}
                baseY={baseY}
              />
            ))}
          </Svg>
        )}

        {chartWidth > 0 && (
          <View style={styles.labelRow} pointerEvents="none">
            {barLayout.map((b, i) => (
              <Text
                key={data[i].date}
                style={[styles.label, { left: b.slotCenter - 18, width: 36 }]}
                numberOfLines={1}
              >
                {labelFor(data[i].date, range)}
              </Text>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.footer}>
        {maxValue === 0
          ? 'No activity yet in this range'
          : `Peak: ${maxValue.toLocaleString()} dhikr`}
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: 0.2,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: ACCENT_LIGHT,
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  toggleBtnActive: {
    backgroundColor: ACCENT,
  },
  toggleBtnPressed: {
    opacity: 0.7,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 0.5,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  chartWrap: {
    height: CHART_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  labelRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_LABEL_AREA,
  },
  label: {
    position: 'absolute',
    bottom: 2,
    fontSize: 10,
    color: TEXT_MID,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    fontSize: 11,
    color: TEXT_DIM,
    marginTop: 6,
    textAlign: 'right',
  },
});
