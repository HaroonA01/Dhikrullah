import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  HeartHandshake,
  Layers,
  MessageCircle,
  Share2,
  Sparkles,
} from 'lucide-react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { useDhikrContent } from '@/context/CounterContext';
import { usePrefs } from '@/context/PrefsContext';
import { useTheme } from '@/context/ThemeContext';
import { type Palette } from '@/constants/themes';
import { getDailyStatsForDate, getMeta } from '@/db/queries';
import { ARABIC_FONTS } from '@/lib/fonts';
import {
  formatHM,
  getDisplayStreak,
  META_KEY_LIFETIME_DHIKR,
  META_KEY_LONGEST_STREAK,
  todayKey,
} from '@/lib/stats';
import { APP_STORE_URL } from '@/constants/about';
import type { CategoryId } from '@/types';

const SCREEN_W = Dimensions.get('window').width;
const TILE_COUNT = 3;
const GRID_LINE = 'rgba(128,128,128,0.12)';

const CATEGORY_LABEL: Partial<Record<CategoryId, string>> = {
  all_day: 'Daily',
  waking_up: 'Upon Waking',
  morning: 'Morning',
  evening: 'Evening',
  night: 'Night',
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  witr: 'Witr',
  before_bed: 'Before Bed',
};

function getDayOfYear(date: Date): number {
  return Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );
}

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function ShareButton({ label, onPress, palette }: { label: string; onPress: () => void; palette: Palette }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: palette.accent, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Share2 size={15} color="#fff" strokeWidth={2} />
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

function Dots({ count, active, palette }: { count: number; active: number; palette: Palette }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: palette.accent,
              width: i === active ? 22 : 7,
              opacity: i === active ? 1 : 0.25,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function ShareScreen() {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const { arabicFont } = usePrefs();
  const { dhikrsByCategory } = useDhikrContent();
  const [dhikrCount, setDhikrCount] = useState<number | null>(null);
  const [timeSeconds, setTimeSeconds] = useState<number | null>(null);
  const [categoriesCompleted, setCategoriesCompleted] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lifetimeDhikr, setLifetimeDhikr] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tileH, setTileH] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const arabicFF = ARABIC_FONTS.find((f) => f.id === arabicFont)?.fontFamily ?? undefined;

  const allDhikrs = Object.values(dhikrsByCategory)
    .flat()
    .sort((a, b) => a.id.localeCompare(b.id));

  const featured = allDhikrs.length > 0
    ? allDhikrs[getDayOfYear(new Date()) % allDhikrs.length]
    : null;

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [rows, s, longest, lifetime] = await Promise.all([
          getDailyStatsForDate(todayKey()),
          getDisplayStreak(),
          getMeta(META_KEY_LONGEST_STREAK),
          getMeta(META_KEY_LIFETIME_DHIKR),
        ]);
        setDhikrCount(rows[0]?.dhikrCount ?? 0);
        setTimeSeconds(rows[0]?.timeSeconds ?? 0);
        setCategoriesCompleted(rows[0]?.categoriesCompleted ?? 0);
        setStreak(s);
        setLongestStreak(Number(longest ?? 0));
        setLifetimeDhikr(Number(lifetime ?? 0));
      };
      load();
    }, []),
  );

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
      setActiveIndex(Math.max(0, Math.min(TILE_COUNT - 1, index)));
    },
    [],
  );

  const shareDhikr = async () => {
    if (!featured) return;
    const lines: string[] = [featured.arabic, '', featured.transliteration, '', `"${featured.translation}"`];
    if (featured.reference) lines.push('', `— ${featured.reference}`);
    lines.push('', 'Shared via Dhikrullah');
    await Share.share({ message: lines.join('\n') });
  };

  const shareProgress = async () => {
    const count = dhikrCount ?? 0;
    const lines: string[] = [`Alhamdulillah! I completed ${count} dhikr${count !== 1 ? 's' : ''} today.`];
    if (streak > 0) lines.push(`Current streak: ${streak} day${streak !== 1 ? 's' : ''} 🔥`);
    if (lifetimeDhikr > 0) lines.push(`Lifetime total: ${lifetimeDhikr.toLocaleString()} dhikrs`);
    lines.push('', APP_STORE_URL);
    await Share.share({ message: lines.join('\n') });
  };

  const shareApp = async () => {
    await Share.share({
      message: `I've been using Dhikrullah to build my daily dhikr habit. Check it out:\n\n${APP_STORE_URL}`,
    });
  };

  const statCells = [
    { Icon: CheckCircle2, value: dhikrCount !== null ? formatStat(dhikrCount) : '—', label: 'Today',      subLabel: 'Dhikrs completed' },
    { Icon: Clock,        value: timeSeconds !== null ? formatHM(timeSeconds) : '—', label: 'Time',       subLabel: 'Spent in Dhikr' },
    { Icon: Layers,       value: categoriesCompleted !== null ? formatStat(categoriesCompleted) : '—', label: 'Categories', subLabel: 'Explored' },
    { Icon: Flame,        value: formatStat(streak),        label: 'Streak',      subLabel: 'Days in a row', accent: true },
    { Icon: Award,        value: formatStat(longestStreak), label: 'Best Streak', subLabel: 'Your record' },
    { Icon: BookOpen,     value: formatStat(lifetimeDhikr), label: 'Lifetime',    subLabel: 'Total Dhikrs' },
  ];

  return (
    <View style={styles.root}>
      <GradientBackground />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.wordmark, { color: palette.accent }]}>DHIKRULLAH</Text>
        <Text style={[styles.title, { color: palette.textDark }]}>Spread the Reward</Text>
      </View>

      <View
        style={styles.carouselWrap}
        onLayout={(e) => setTileH(e.nativeEvent.layout.height)}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          scrollEventThrottle={16}
          style={styles.scroll}
        >

          {/* ────────────────────────────────────────
              Tile 1 — Daily Dhikr
          ──────────────────────────────────────── */}
          <View style={[styles.tile, { height: tileH }]}>
            <GlassCard style={styles.card}>

              {/* Title + meta chips */}
              <View style={styles.dhikrHeader}>
                <Sparkles size={16} color={palette.accent} strokeWidth={1.8} />
                <Text style={[styles.tileTitle, { color: palette.textDark, marginBottom: 0 }]}>Daily Dhikr</Text>
                {featured && (
                  <View style={[styles.chip, { backgroundColor: palette.accentLight }]}>
                    <Text style={[styles.chipText, { color: palette.accent }]}>
                      {CATEGORY_LABEL[featured.categoryId] ?? 'Dhikr'}
                    </Text>
                  </View>
                )}
                {featured && featured.target > 1 && (
                  <View style={[styles.chip, { backgroundColor: palette.glassBorder }]}>
                    <Text style={[styles.chipText, { color: palette.textMid }]}>× {featured.target}</Text>
                  </View>
                )}
              </View>

              {/* Arabic + transliteration — centered block */}
              <View style={styles.dhikrArabicBlock}>
                <Text
                  numberOfLines={4}
                  ellipsizeMode="tail"
                  style={[styles.arabic, { color: palette.textDark, fontFamily: arabicFF, textAlign: 'center' }]}
                >
                  {featured?.arabic ?? '—'}
                </Text>
                <Text
                  numberOfLines={3}
                  ellipsizeMode="tail"
                  style={[styles.translit, { color: palette.textMid, textAlign: 'center', marginTop: 6 }]}
                >
                  {featured?.transliteration ?? '—'}
                </Text>
              </View>

              {/* Meaning box */}
              <View style={[styles.dhikrBox, { backgroundColor: palette.accentLight }]}>
                <View style={styles.dhikrBoxHeader}>
                  <MessageCircle size={14} color={palette.accent} strokeWidth={2} />
                  <Text style={[styles.dhikrRowLabel, { color: palette.accent }]}>Meaning</Text>
                </View>
                <Text numberOfLines={3} ellipsizeMode="tail" style={[styles.translation, { color: palette.textDark }]}>
                  {featured ? `"${featured.translation}"` : '—'}
                </Text>
              </View>

              {/* Source box */}
              <View style={[styles.dhikrBox, { backgroundColor: palette.accentLight }]}>
                <View style={styles.dhikrBoxHeader}>
                  <BookOpen size={14} color={palette.accent} strokeWidth={2} />
                  <Text style={[styles.dhikrRowLabel, { color: palette.accent }]}>Source</Text>
                </View>
                <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.ref, { color: palette.textDim }]}>
                  {featured?.reference ?? '(To be confirmed)'}
                </Text>
              </View>

              <ShareButton label="Share this Dhikr" onPress={shareDhikr} palette={palette} />
            </GlassCard>
          </View>

          {/* ────────────────────────────────────────
              Tile 2 — Progress
          ──────────────────────────────────────── */}
          <View style={[styles.tile, { height: tileH }]}>
            <GlassCard style={styles.card}>

              <View style={styles.progressHeader}>
                <Text style={[styles.tileTitle, { color: palette.textDark }]}>Your Progress</Text>
                <Text style={[styles.todayDate, { color: palette.textDim }]}>
                  {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                </Text>
              </View>

              {/* 2×3 stat grid */}
              <View style={styles.statGrid}>
                {statCells.map((cell, i) => (
                  <View
                    key={i}
                    style={[
                      styles.statCell,
                      {
                        borderRightWidth: i % 2 !== 1 ? 1 : 0,
                        borderBottomWidth: i < 4 ? 1 : 0,
                        borderColor: GRID_LINE,
                      },
                    ]}
                  >
                    <cell.Icon size={18} color={palette.accent} strokeWidth={1.5} />
                    <Text
                      style={[
                        styles.statValue,
                        { color: cell.accent ? palette.accent : palette.textDark },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {cell.value}
                    </Text>
                    <Text style={[styles.statCellLabel, { color: cell.accent ? palette.accent : palette.textDark }]}>
                      {cell.label}
                    </Text>
                    <Text style={[styles.statCellSub, { color: palette.textDim }]}>
                      {cell.subLabel}
                    </Text>
                  </View>
                ))}
              </View>

              <ShareButton label="Share my Progress" onPress={shareProgress} palette={palette} />
            </GlassCard>
          </View>

          {/* ────────────────────────────────────────
              Tile 3 — Share App / Hadith
          ──────────────────────────────────────── */}
          <View style={[styles.tile, { height: tileH }]}>
            <GlassCard style={styles.card}>

              {/* App logo block */}
              <View style={styles.appLogoBlock}>
                <View style={[styles.appLogoCircle, { backgroundColor: palette.accentLight, borderColor: palette.glassBorder }]}>
                  <HeartHandshake size={32} color={palette.accent} strokeWidth={1.6} />
                </View>
                <Text style={[styles.appWordmark, { color: palette.accent }]}>DHIKRULLAH</Text>
                <Text style={[styles.appSubtitle, { color: palette.textDark }]}>Spread the Reward</Text>
              </View>

              {/* Hadith */}
              <View style={[styles.hadithBlock, { borderLeftColor: palette.accent }]}>
                <Text style={[styles.hadithText, { color: palette.textDark }]}>
                  Whoever guides someone to a good deed will have a reward like the one who does it.
                </Text>
                <Text style={[styles.hadithRef, { color: palette.textDim }]}>— Sahih Muslim 1893</Text>
              </View>

              {/* Text — vertically centred in remaining space */}
              <View style={styles.hadithCentre}>
                <Text style={[styles.explanation, { color: palette.textMid }]}>
                  Every time someone you share Dhikrullah with completes a dhikr, you receive a reward equal to theirs — without diminishing it in the slightest. This is Sadaqah Jariyah: a continuous charity that does not end with this life.
                </Text>
              </View>

              <ShareButton label="Share the App" onPress={shareApp} palette={palette} />
            </GlassCard>
          </View>

        </ScrollView>
      </View>

      <View style={[styles.dotsWrap, { paddingBottom: insets.bottom + 88 }]}>
        <Dots count={TILE_COUNT} active={activeIndex} palette={palette} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  wordmark: { fontSize: 12, letterSpacing: 1.5, fontWeight: '600', opacity: 0.8 },
  title: { fontSize: 26, fontWeight: '700', marginTop: 2 },
  carouselWrap: { flex: 1 },
  scroll: { flex: 1 },
  tile: { width: SCREEN_W, padding: 14 },
  card: { flex: 1, padding: 16 },
  tileTitle: { fontSize: 20, fontWeight: '400', marginBottom: 0 },

  // ── Tile 1 ──
  dhikrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  chipText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  dhikrArabicBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dhikrBox: {
    borderRadius: 10,
    padding: 12,
    gap: 4,
    marginTop: 10,
  },
  dhikrBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  dhikrRowLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 0.3, textTransform: 'uppercase' },
  arabic: { fontSize: 24, lineHeight: 40 },
  translit: { fontSize: 13, fontStyle: 'italic', lineHeight: 20 },
  translation: { fontSize: 13, lineHeight: 20 },
  ref: { fontSize: 12, lineHeight: 17 },

  // ── Tile 2 ──
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  todayDate: { fontSize: 12, fontWeight: '500' },
  statGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  statCell: {
    width: '50%',
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
    textAlign: 'center',
  },
  statCellLabel: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  statCellSub: {
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 13,
  },

  // ── Tile 3 ──
  appLogoBlock: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  appLogoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appWordmark: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  hadithBlock: {
    borderLeftWidth: 3,
    paddingLeft: 14,
    marginBottom: 16,
    gap: 6,
  },
  hadithText: {
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '400',
  },
  hadithRef: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  explanation: {
    fontSize: 13,
    lineHeight: 21,
  },
  hadithCentre: {
    flex: 1,
    justifyContent: 'center',
  },

  // ── Shared ──
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 12,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  dotsWrap: { alignItems: 'center', paddingTop: 8 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { height: 7, borderRadius: 4 },
});
