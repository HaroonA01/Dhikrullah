import { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, Clock, Flame, Sparkles } from 'lucide-react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { StatTile } from '@/components/StatTile';
import {
  StatBarChart,
  type ChartDatum,
  type ChartRange,
} from '@/components/StatBarChart';
import { CategoryHeatmap } from '@/components/CategoryHeatmap';
import { useDhikrContent } from '@/context/CounterContext';
import { useTheme } from '@/context/ThemeContext';
import {
  getCategoryProgressInRange,
  getDailyStatsForDate,
  getDailyStatsRange,
  getMeta,
} from '@/db/queries';
import {
  currentWeekDays,
  formatHM,
  getDisplayStreak,
  lastNDays,
  lastNMonths,
  META_KEY_LIFETIME_DHIKR,
  META_KEY_LIFETIME_SECONDS,
  monthEndDateKey,
  todayKey,
} from '@/lib/stats';

const MONTHS_RANGE = 6;

async function buildChartData(range: ChartRange): Promise<ChartDatum[]> {
  if (range === '6m') {
    const monthKeys = lastNMonths(MONTHS_RANGE);
    const start = monthKeys[0];
    const end = monthEndDateKey(monthKeys[monthKeys.length - 1]);
    const rows = await getDailyStatsRange(start, end);
    const totals = new Map<string, number>(monthKeys.map((k) => [k, 0]));
    for (const r of rows) {
      const monthKey = `${r.date.slice(0, 7)}-01`;
      totals.set(monthKey, (totals.get(monthKey) ?? 0) + r.dhikrCount);
    }
    return monthKeys.map((k) => ({ date: k, value: totals.get(k) ?? 0 }));
  }

  const n = range === '7d' ? 7 : 10;
  const dayKeys = lastNDays(n);
  const rows = await getDailyStatsRange(dayKeys[0], dayKeys[dayKeys.length - 1]);
  const byDate = new Map(rows.map((r) => [r.date, r.dhikrCount]));
  return dayKeys.map((d) => ({ date: d, value: byDate.get(d) ?? 0 }));
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const { categories } = useDhikrContent();
  const [streak, setStreak] = useState(0);
  const [lifetimeDhikr, setLifetimeDhikr] = useState(0);
  const [lifetimeSeconds, setLifetimeSeconds] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(0);
  const [chartRange, setChartRange] = useState<ChartRange>('7d');
  const [chartData, setChartData] = useState<ChartDatum[]>([]);
  const [weekDates, setWeekDates] = useState<string[]>(() => currentWeekDays());
  const [percents, setPercents] = useState<Map<string, number>>(new Map());
  const [today, setToday] = useState<string>(() => todayKey());
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    const week = currentWeekDays();
    const todayK = todayKey();
    const [s, lt, ls, todayRows, chart, progressRows] = await Promise.all([
      getDisplayStreak(),
      getMeta(META_KEY_LIFETIME_DHIKR),
      getMeta(META_KEY_LIFETIME_SECONDS),
      getDailyStatsForDate(todayK),
      buildChartData(chartRange),
      getCategoryProgressInRange(week[0], week[6]),
    ]);
    setStreak(s);
    setLifetimeDhikr(Number(lt ?? '0'));
    setLifetimeSeconds(Number(ls ?? '0'));
    setTodayCompleted(todayRows[0]?.categoriesCompleted ?? 0);
    setChartData(chart);
    setWeekDates(week);
    setToday(todayK);
    setPercents(
      new Map(progressRows.map((r) => [`${r.date}|${r.categoryId}`, r.percent])),
    );
  }, [chartRange]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await loadAll();
        } catch {}
        if (cancelled) return;
      })();
      return () => {
        cancelled = true;
      };
    }, [loadAll]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } catch {}
    setRefreshing(false);
  }, [loadAll]);

  const totalCategories = categories.length;

  return (
    <View style={styles.root}>
      <GradientBackground />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.wordmark, { color: palette.accent }]}>Dhikrullah</Text>
        <Text style={[styles.title, { color: palette.textDark }]}>Stats</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.accent}
            colors={[palette.accent]}
          />
        }
      >
        <View style={styles.row}>
          <StatTile
            Icon={Flame}
            label="Current Streak"
            value={streak === 1 ? '1 day' : `${streak} days`}
            caption="+1 each day a full category is completed"
          />
          <StatTile
            Icon={Clock}
            label="Total Time"
            value={lifetimeSeconds > 0 ? formatHM(lifetimeSeconds) : '0m'}
            caption="Active time in the dhikr counter"
          />
        </View>

        <View style={styles.row}>
          <StatTile
            Icon={Sparkles}
            label="Lifetime Dhikr"
            value={lifetimeDhikr.toLocaleString()}
            caption="Total recitations counted to date"
          />
          <StatTile
            Icon={CheckCircle2}
            label="Today"
            value={`${todayCompleted} / `}
            valueSuffix={String(totalCategories || 0)}
            caption="Categories completed today"
          />
        </View>

        <StatBarChart
          title="Daily Activity"
          data={chartData}
          range={chartRange}
          onRangeChange={setChartRange}
        />

        <CategoryHeatmap
          categories={categories}
          weekDates={weekDates}
          todayKey={today}
          percents={percents}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  wordmark: {
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '600',
    opacity: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
