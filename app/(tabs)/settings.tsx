import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  BellOff,
  BedDouble,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Compass,
  Coffee,
  Code,
  Mail,
  MapPin,
  Palette as PaletteIcon,
  Play,
  Scale,
  Sparkles,
  SunMoon,
  Tag,
  ChartNoAxesColumnIncreasing,
  Type,
  Vibrate,
  Volume2,
} from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GradientBackground } from '@/components/GradientBackground';
import { SettingsSection } from '@/components/SettingsSection';
import { SettingsRow } from '@/components/SettingsRow';
import { ThemeSwatch } from '@/components/ThemeSwatch';
import { CitySearchModal } from '@/components/CitySearchModal';
import { useTheme, type Mode } from '@/context/ThemeContext';
import { usePrefs, PRAYER_CATEGORY_IDS, type NotifOffset } from '@/context/PrefsContext';
import { METHODS, type Madhab, type MethodId } from '@/lib/prayer';
import { requestDeviceLocation, type LocationData } from '@/lib/location';
import { requestNotificationPermission } from '@/lib/notifications';
import { FEEDBACK_SUBJECT, SUPPORT_EMAIL } from '@/constants/about';
import { ARABIC_FONTS, ENGLISH_FONTS, TEXT_SIZE_OPTIONS } from '@/lib/fonts';
import { NOTIF_SOUND_LABELS, NOTIF_SOUND_ASSETS, type NotifSoundId } from '@/lib/soundMap';
import type { CategoryId } from '@/types';

const MODES: { id: Mode; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

const MADHABS: { id: Madhab; label: string }[] = [
  { id: 'shafi', label: 'Shafi' },
  { id: 'hanafi', label: 'Hanafi' },
];

const NOTIF_OFFSET_OPTIONS: { value: NotifOffset; label: string }[] = [
  { value: 0, label: 'Adhan' },
  { value: 10, label: '+10m' },
  { value: 30, label: '+30m' },
  { value: 60, label: '+1h' },
];

const ALL_CATEGORY_IDS: CategoryId[] = [
  'all_day', 'fajr', 'morning', 'waking_up', 'dhuhr', 'asr',
  'evening', 'maghrib', 'isha', 'witr', 'before_bed',
];

const CATEGORY_DISPLAY: Record<CategoryId, string> = {
  all_day: 'All Day',
  fajr: 'Fajr',
  morning: 'Morning',
  waking_up: 'Waking Up',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  evening: 'Evening',
  maghrib: 'Maghrib',
  isha: 'Isha',
  witr: 'Witr',
  before_bed: 'Before Bed',
};

const minutesToTimeString = (minutes: number): string => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    palette, mode, setMode, themeId, setThemeId, themes,
    visibleSpecialThemes, activeSpecialTheme, setActiveSpecialTheme, hideSpecialTheme,
  } = useTheme();
  const {
    hapticsIndividual,
    setHapticsIndividual,
    hapticsComplete,
    setHapticsComplete,
    prayerMethodId,
    setPrayerMethodId,
    madhab,
    setMadhab,
    location,
    setLocation,
    wakingUpMinutes,
    setWakingUpMinutes,
    beforeBedMinutes,
    setBeforeBedMinutes,
    notifEnabled,
    setNotifEnabled,
    setAllNotifEnabled,
    notifOffset,
    setNotifOffset,
    arabicFont,
    setArabicFont,
    englishFont,
    setEnglishFont,
    textSize,
    setTextSize,
    notifSound,
    setNotifSound,
  } = usePrefs();

  const [methodPickerOpen, setMethodPickerOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState<'waking_up' | 'before_bed' | null>(null);
  const [expandedPrayers, setExpandedPrayers] = useState<Set<CategoryId>>(new Set());
  const [arabicFontOpen, setArabicFontOpen] = useState(false);
  const [englishFontOpen, setEnglishFontOpen] = useState(false);
  const [soundPickerOpen, setSoundPickerOpen] = useState(false);

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const currentMethod = METHODS.find((m) => m.id === prayerMethodId) ?? METHODS[0];
  const currentTheme = themes.find((t) => t.id === themeId) ?? themes[0];
  const displayThemeName = activeSpecialTheme?.name ?? currentTheme.name;

  const applyLocation = (loc: LocationData) => {
    setLocation(loc);
    if (loc.label.includes('London') && loc.label.includes('United Kingdom')) {
      setPrayerMethodId('ELM');
    }
  };

  const useDeviceLocation = async () => {
    const result = await requestDeviceLocation();
    if (!result) {
      Alert.alert(
        'Location unavailable',
        'Permission denied or location lookup failed. Try searching for your city instead.',
      );
      return;
    }
    applyLocation(result);
    setLocationPickerOpen(false);
  };

  const handleCitySelect = (loc: LocationData) => {
    applyLocation(loc);
    setCitySearchOpen(false);
  };

  const openContact = () => {
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `${FEEDBACK_SUBJECT} (v${version})`,
      )}`,
    ).catch(() => {
      Alert.alert('Could not open email', `Please email ${SUPPORT_EMAIL}.`);
    });
  };

  const allEnabled = ALL_CATEGORY_IDS.every((id) => notifEnabled[id]);

  const handleToggleAll = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Permission required',
          'Allow notifications in Settings to receive dhikr reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
    }
    if (!val) setExpandedPrayers(new Set());
    setAllNotifEnabled(val);
  };

  const handleNotifToggle = async (id: CategoryId, val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Permission required',
          'Allow notifications in Settings to receive dhikr reminders.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
    }
    if (!val) {
      setExpandedPrayers((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    setNotifEnabled(id, val);
  };

  const togglePrayerExpanded = (id: CategoryId) => {
    setExpandedPrayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <View style={styles.root}>
      <GradientBackground />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.wordmark, { color: palette.accent }]}>Dhikrullah</Text>
        <Text style={[styles.title, { color: palette.textDark }]}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Appearance">
          <SettingsRow
            label="Appearance"
            Icon={SunMoon}
            trailing={
              <Segmented
                options={MODES}
                value={mode}
                onChange={setMode}
                palette={palette}
              />
            }
          />
          <SettingsRow
            label="Theme"
            Icon={PaletteIcon}
            trailing={
              <Text style={[styles.trailingText, { color: palette.accent }]}>
                {displayThemeName}
              </Text>
            }
            isLast
          />
          <ThemeRow
            themes={themes}
            themeId={themeId}
            setThemeId={setThemeId}
            palette={palette}
            visibleSpecialThemes={visibleSpecialThemes}
            activeSpecialTheme={activeSpecialTheme}
            setActiveSpecialTheme={setActiveSpecialTheme}
            hideSpecialTheme={hideSpecialTheme}
          />
        </SettingsSection>

        <SettingsSection title="Haptics">
          <SettingsRow
            label="Individual dhikr"
            detail="Light tap on every count"
            Icon={Vibrate}
            trailing={
              <Switch
                value={hapticsIndividual}
                onValueChange={setHapticsIndividual}
                trackColor={{ false: palette.glassBorder, true: palette.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingsRow
            label="Complete dhikr"
            detail="Stronger pulse when target reached"
            Icon={Sparkles}
            isLast
            trailing={
              <Switch
                value={hapticsComplete}
                onValueChange={setHapticsComplete}
                trackColor={{ false: palette.glassBorder, true: palette.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Typography">
          <SettingsRow
            label="Arabic Font"
            Icon={Type}
            detail={ARABIC_FONTS.find(f => f.id === arabicFont)?.label}
            showChevron
            onPress={() => setArabicFontOpen(true)}
          />
          <SettingsRow
            label="English Font"
            Icon={Type}
            detail={ENGLISH_FONTS.find(f => f.id === englishFont)?.label}
            showChevron
            onPress={() => setEnglishFontOpen(true)}
          />
          <SettingsRow
            label="Text Size"
            Icon={ChartNoAxesColumnIncreasing}
            isLast
            trailing={
              <Segmented
                options={TEXT_SIZE_OPTIONS}
                value={textSize}
                onChange={setTextSize}
                palette={palette}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Prayer Times">
          <SettingsRow
            label="Location"
            detail={location?.label ?? 'Not set'}
            Icon={MapPin}
            showChevron
            onPress={() => setLocationPickerOpen(true)}
          />
          <SettingsRow
            label="Calculation method"
            detail={currentMethod.label}
            Icon={Compass}
            showChevron
            onPress={() => setMethodPickerOpen(true)}
          />
          <SettingsRow
            label="Madhab (Asr)"
            Icon={Scale}
            isLast
            trailing={
              <Segmented
                options={MADHABS}
                value={madhab}
                onChange={setMadhab}
                palette={palette}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="Schedule">
          <SettingsRow
            label="Waking Up"
            detail={minutesToTimeString(wakingUpMinutes)}
            Icon={Coffee}
            showChevron
            onPress={() => setTimePickerOpen('waking_up')}
          />
          <SettingsRow
            label="Before Bed"
            detail={minutesToTimeString(beforeBedMinutes)}
            Icon={BedDouble}
            isLast
            showChevron
            onPress={() => setTimePickerOpen('before_bed')}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            label="Notification Sound"
            detail={NOTIF_SOUND_LABELS[notifSound]}
            Icon={Volume2}
            showChevron
            onPress={() => setSoundPickerOpen(true)}
          />
          <SettingsRow
            label="All Notifications"
            detail={allEnabled ? 'All reminders on' : 'All reminders off'}
            Icon={allEnabled ? Bell : BellOff}
            trailing={
              <Switch
                value={allEnabled}
                onValueChange={handleToggleAll}
                trackColor={{ false: palette.glassBorder, true: palette.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
          {!location ? (
            <View style={[styles.notifNote, { borderColor: palette.glassBorder }]}>
              <Text style={[styles.notifNoteText, { color: palette.textMid }]}>
                Set a location in Prayer Times to enable prayer-based notifications.
              </Text>
            </View>
          ) : null}
          {ALL_CATEGORY_IDS.map((id, i) => {
            const isPrayer = PRAYER_CATEGORY_IDS.includes(id);
            const enabled = notifEnabled[id] ?? false;
            const offset = notifOffset[id] ?? 0;
            const expanded = expandedPrayers.has(id);
            const isLast = i === ALL_CATEGORY_IDS.length - 1;
            const showOffset = isPrayer && enabled && expanded;
            return (
              <View key={id}>
                <SettingsRow
                  label={CATEGORY_DISPLAY[id]}
                  Icon={enabled ? Bell : BellOff}
                  isLast={isLast && !showOffset}
                  trailing={
                    <View style={styles.rowTrailing}>
                      {isPrayer && enabled ? (
                        <Pressable
                          onPress={() => togglePrayerExpanded(id)}
                          hitSlop={8}
                          style={styles.chevronBtn}
                        >
                          {expanded
                            ? <ChevronUp size={16} color={palette.accent} strokeWidth={2.5} />
                            : <ChevronDown size={16} color={palette.accent} strokeWidth={2.5} />
                          }
                        </Pressable>
                      ) : null}
                      <Switch
                        value={enabled}
                        onValueChange={(v) => handleNotifToggle(id, v)}
                        trackColor={{ false: palette.glassBorder, true: palette.accent }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                  }
                />
                {showOffset ? (
                  <View
                    style={[
                      styles.offsetRow,
                      isLast && styles.offsetRowLast,
                      { borderTopColor: palette.glassBorder },
                    ]}
                  >
                    <Text style={[styles.offsetLabel, { color: palette.textMid }]}>
                      Notify
                    </Text>
                    <Segmented
                      options={NOTIF_OFFSET_OPTIONS.map((o) => ({ id: String(o.value) as string & NotifOffset, label: o.label }))}
                      value={String(offset)}
                      onChange={(v) => setNotifOffset(id, Number(v) as NotifOffset)}
                      palette={palette}
                    />
                  </View>
                ) : null}
              </View>
            );
          })}
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow label="Version" detail={version} Icon={Tag} />
          <SettingsRow
            label="Contact"
            detail={SUPPORT_EMAIL}
            Icon={Mail}
            showChevron
            onPress={openContact}
          />
          <SettingsRow
            label="Open Source"
            detail="View on GitHub"
            Icon={Code}
            showChevron
            onPress={() => Linking.openURL('https://github.com')}
            isLast
          />
        </SettingsSection>
      </ScrollView>

      <MethodPicker
        visible={methodPickerOpen}
        currentId={prayerMethodId}
        onSelect={(id) => {
          setPrayerMethodId(id);
          setMethodPickerOpen(false);
        }}
        onClose={() => setMethodPickerOpen(false)}
        palette={palette}
      />

      <LocationPickerModal
        visible={locationPickerOpen}
        onUseDevice={useDeviceLocation}
        onSearch={() => {
          setLocationPickerOpen(false);
          setTimeout(() => setCitySearchOpen(true), 250);
        }}
        onClose={() => setLocationPickerOpen(false)}
        palette={palette}
      />

      <CitySearchModal
        visible={citySearchOpen}
        onSelect={handleCitySelect}
        onClose={() => setCitySearchOpen(false)}
      />

      <TimePickerModal
        visible={timePickerOpen !== null}
        title={timePickerOpen === 'waking_up' ? 'Waking Up Time' : 'Before Bed Time'}
        currentMinutes={timePickerOpen === 'waking_up' ? wakingUpMinutes : beforeBedMinutes}
        onSelect={(m) => {
          if (timePickerOpen === 'waking_up') setWakingUpMinutes(m);
          else if (timePickerOpen === 'before_bed') setBeforeBedMinutes(m);
          setTimePickerOpen(null);
        }}
        onClose={() => setTimePickerOpen(null)}
        palette={palette}
      />

      <FontPickerModal
        visible={arabicFontOpen}
        title="Arabic Font"
        options={ARABIC_FONTS}
        currentId={arabicFont}
        onSelect={(id) => {
          setArabicFont(id);
          setArabicFontOpen(false);
        }}
        onClose={() => setArabicFontOpen(false)}
        palette={palette}
        isArabic
      />

      <FontPickerModal
        visible={englishFontOpen}
        title="English Font"
        options={ENGLISH_FONTS}
        currentId={englishFont}
        onSelect={(id) => {
          setEnglishFont(id);
          setEnglishFontOpen(false);
        }}
        onClose={() => setEnglishFontOpen(false)}
        palette={palette}
      />

      <SoundPickerModal
        visible={soundPickerOpen}
        currentId={notifSound}
        onSelect={(id) => {
          setNotifSound(id);
          setSoundPickerOpen(false);
        }}
        onClose={() => setSoundPickerOpen(false)}
        palette={palette}
      />
    </View>
  );
}

// ─── Time Picker Modal ─────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

interface TimePickerProps {
  visible: boolean;
  title: string;
  currentMinutes: number;
  onSelect: (minutes: number) => void;
  onClose: () => void;
  palette: ReturnType<typeof useTheme>['palette'];
}

function TimePickerModal({ visible, title, currentMinutes, onSelect, onClose, palette }: TimePickerProps) {
  const [h, setH] = useState(Math.floor(currentMinutes / 60));
  const [m, setM] = useState(currentMinutes % 60 < 15 ? 0 : currentMinutes % 60 < 30 ? 15 : currentMinutes % 60 < 45 ? 30 : 45);

  useEffect(() => {
    if (visible) {
      setH(Math.floor(currentMinutes / 60));
      const raw = currentMinutes % 60;
      setM(raw < 15 ? 0 : raw < 30 ? 15 : raw < 45 ? 30 : 45);
    }
  }, [visible, currentMinutes]);

  const cardBg = palette.scheme === 'dark' ? palette.bgMid : '#FFFFFF';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pickerStyles.backdrop} onPress={onClose}>
        <Pressable
          style={[pickerStyles.card, { backgroundColor: cardBg }]}
          onPress={() => {}}
        >
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              pickerStyles.cardBorderOverlay,
              { borderColor: palette.glassBorder },
            ]}
          />
          <Text style={[pickerStyles.title, { color: palette.textDark }]}>{title}</Text>

          <View style={timeStyles.row}>
            <View style={timeStyles.col}>
              <Text style={[timeStyles.colLabel, { color: palette.textMid }]}>Hour</Text>
              <ScrollView style={timeStyles.scroll} showsVerticalScrollIndicator={false}>
                {HOURS.map((hour) => (
                  <Pressable
                    key={hour}
                    onPress={() => setH(hour)}
                    style={[
                      timeStyles.item,
                      h === hour && { backgroundColor: palette.accent },
                    ]}
                  >
                    <Text style={[timeStyles.itemText, { color: h === hour ? '#FFF' : palette.textDark }]}>
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <Text style={[timeStyles.colon, { color: palette.textDark }]}>:</Text>
            <View style={timeStyles.col}>
              <Text style={[timeStyles.colLabel, { color: palette.textMid }]}>Min</Text>
              <View>
                {MINUTES.map((min) => (
                  <Pressable
                    key={min}
                    onPress={() => setM(min)}
                    style={[
                      timeStyles.item,
                      m === min && { backgroundColor: palette.accent },
                    ]}
                  >
                    <Text style={[timeStyles.itemText, { color: m === min ? '#FFF' : palette.textDark }]}>
                      {min.toString().padStart(2, '0')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => onSelect(h * 60 + m)}
            style={({ pressed }) => [
              timeStyles.confirm,
              { backgroundColor: palette.accent },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={timeStyles.confirmText}>Confirm</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const timeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  col: {
    alignItems: 'center',
    flex: 1,
  },
  colLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  scroll: {
    maxHeight: 200,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 2,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  colon: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 36,
  },
  confirm: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

// ─── Theme Row ─────────────────────────────────────────────────────────────

interface ThemeRowProps {
  themes: ReturnType<typeof useTheme>['themes'];
  themeId: string;
  setThemeId: (id: string) => void;
  palette: ReturnType<typeof useTheme>['palette'];
  visibleSpecialThemes: ReturnType<typeof useTheme>['visibleSpecialThemes'];
  activeSpecialTheme: ReturnType<typeof useTheme>['activeSpecialTheme'];
  setActiveSpecialTheme: ReturnType<typeof useTheme>['setActiveSpecialTheme'];
  hideSpecialTheme: ReturnType<typeof useTheme>['hideSpecialTheme'];
}

function ThemeRow({
  themes, themeId, setThemeId, palette,
  visibleSpecialThemes, activeSpecialTheme, setActiveSpecialTheme, hideSpecialTheme,
}: ThemeRowProps) {
  const [scrollX, setScrollX] = useState(0);
  const [contentW, setContentW] = useState(0);
  const [layoutW, setLayoutW] = useState(0);

  const showRightFade = layoutW > 0 && scrollX < contentW - layoutW - 8;

  const bounce = useSharedValue(0);
  const arrowOpacity = useSharedValue(1);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 480 }),
        withTiming(0, { duration: 480 }),
      ),
      3,
      false,
    );
    const timer = setTimeout(() => {
      arrowOpacity.value = withTiming(0, { duration: 350 });
    }, 2900);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bounceStyle = useAnimatedStyle(() => ({
    opacity: arrowOpacity.value,
    transform: [{ translateX: bounce.value }],
  }));

  const handleHideSpecial = (id: string) => {
    Alert.alert(
      'Hide Theme',
      'This will hide the theme from your settings. It will remain active if currently selected. Complete the secret again to make it reappear.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Hide', style: 'destructive', onPress: () => hideSpecialTheme(id) },
      ],
    );
  };

  return (
    <View style={styles.themeBlock}>
      <View style={fadeStyles.outer}>
        <View style={fadeStyles.scrollWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.swatchRow}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setScrollX(x);
              if (x > 4) {
                arrowOpacity.value = withTiming(0, { duration: 200 });
                bounce.value = 0;
              }
            }}
            scrollEventThrottle={16}
            onContentSizeChange={(w) => setContentW(w)}
            onLayout={(e) => setLayoutW(e.nativeEvent.layout.width)}
          >
            {themes.map((t) => (
              <View key={t.id} style={styles.swatchCol}>
                <ThemeSwatch
                  theme={t}
                  selected={t.id === themeId && !activeSpecialTheme}
                  onPress={() => setThemeId(t.id)}
                />
                <Text
                  style={[
                    styles.swatchLabel,
                    {
                      color: (t.id === themeId && !activeSpecialTheme) ? palette.accent : palette.textMid,
                      fontWeight: (t.id === themeId && !activeSpecialTheme) ? '700' : '500',
                    },
                  ]}
                >
                  {t.name.replace(' ', '\n')}
                </Text>
              </View>
            ))}
            {visibleSpecialThemes.map((st) => (
              <View key={st.id} style={styles.swatchCol}>
                <ThemeSwatch
                  kind="special"
                  theme={st}
                  selected={activeSpecialTheme?.id === st.id}
                  onPress={() => setActiveSpecialTheme(st.id)}
                  onLongPress={() => handleHideSpecial(st.id)}
                  delayLongPress={3000}
                />
                <Text
                  style={[
                    styles.swatchLabel,
                    {
                      color: '#D4AF37',
                      fontWeight: activeSpecialTheme?.id === st.id ? '800' : '700',
                    },
                  ]}
                >
                  {st.name.replace(' ', '\n')}
                </Text>
              </View>
            ))}
          </ScrollView>

        </View>

        {showRightFade ? (
          <Animated.View style={[fadeStyles.chevron, bounceStyle]} pointerEvents="none">
            <ChevronRight size={18} color={palette.accent} strokeWidth={2.5} />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const fadeStyles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollWrap: {
    flex: 1,
    position: 'relative',
  },
  chevron: {
    paddingLeft: 4,
    paddingRight: 6,
  },
});

interface SegmentedProps<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  palette: ReturnType<typeof useTheme>['palette'];
}

function Segmented<T extends string>({ options, value, onChange, palette }: SegmentedProps<T>) {
  return (
    <View
      style={[
        segStyles.wrap,
        { backgroundColor: palette.accentLight },
      ]}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={[
              segStyles.btn,
              active && { backgroundColor: palette.accent },
            ]}
          >
            <Text
              style={[
                segStyles.text,
                { color: active ? '#FFFFFF' : palette.accent },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const segStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

interface FontPickerModalProps<T extends string> {
  visible: boolean;
  title: string;
  options: readonly { id: T; label: string; fontFamily: string | null }[];
  currentId: T;
  onSelect: (id: T) => void;
  onClose: () => void;
  palette: ReturnType<typeof useTheme>['palette'];
  isArabic?: boolean;
}

function FontPickerModal<T extends string>({
  visible,
  title,
  options,
  currentId,
  onSelect,
  onClose,
  palette,
  isArabic,
}: FontPickerModalProps<T>) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pickerStyles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            pickerStyles.card,
            { backgroundColor: '#FFFFFF', borderRadius: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 10 },
          ]}
          onPress={() => {}}
        >
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              pickerStyles.cardBorderOverlay,
              { borderColor: palette.glassBorder },
            ]}
          />
          <View style={{ height: 3, width: 40, backgroundColor: palette.accent, borderRadius: 2, alignSelf: 'center', marginBottom: 12 }} />
          <Text style={[pickerStyles.title, { color: palette.textDark }]}>
            {title}
          </Text>
          <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
            {options.map((opt, i) => {
              const active = opt.id === currentId;
              const previewText = isArabic ? 'ذكر الله' : 'Dhikrullah';
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => onSelect(opt.id)}
                  style={({ pressed }) => [
                    pickerStyles.row,
                    active && { backgroundColor: palette.accentLight, borderRadius: 8 },
                    i !== options.length - 1 && {
                      borderBottomColor: palette.glassBorder,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Text
                    style={[
                      pickerStyles.rowLabel,
                      {
                        color: palette.textDark,
                        fontWeight: active ? '700' : '500',
                        fontFamily: opt.fontFamily ?? undefined,
                      },
                    ]}
                  >
                    {previewText}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Text
                    style={[
                      {
                        color: palette.textMid,
                        fontSize: 13,
                        fontWeight: active ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {active ? (
                    <Check size={18} color={palette.accent} strokeWidth={2.5} style={{ marginLeft: 8 }} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface SoundPickerModalProps {
  visible: boolean;
  currentId: NotifSoundId;
  onSelect: (id: NotifSoundId) => void;
  onClose: () => void;
  palette: ReturnType<typeof useTheme>['palette'];
}

function SoundPickerModal({ visible, currentId, onSelect, onClose, palette }: SoundPickerModalProps) {
  const previewRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!visible) {
      previewRef.current?.unloadAsync().catch(() => {});
      previewRef.current = null;
    }
  }, [visible]);

  const playPreview = async (id: NotifSoundId) => {
    const asset = NOTIF_SOUND_ASSETS[id];
    if (!asset) return;
    previewRef.current?.unloadAsync().catch(() => {});
    const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: true });
    previewRef.current = sound;
  };

  const SOUND_IDS: NotifSoundId[] = ['default', 'chime', 'bell', 'adhan', 'none'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pickerStyles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            pickerStyles.card,
            { backgroundColor: '#FFFFFF', borderRadius: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 10 },
          ]}
          onPress={() => {}}
        >
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              pickerStyles.cardBorderOverlay,
              { borderColor: palette.glassBorder },
            ]}
          />
          <View style={{ height: 3, width: 40, backgroundColor: palette.accent, borderRadius: 2, alignSelf: 'center', marginBottom: 12 }} />
          <Text style={[pickerStyles.title, { color: palette.textDark }]}>
            Notification Sound
          </Text>
          <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
            {SOUND_IDS.map((id, i) => {
              const active = id === currentId;
              const previewable = id !== 'default' && id !== 'none';
              return (
                <Pressable
                  key={id}
                  onPress={() => onSelect(id)}
                  style={({ pressed }) => [
                    pickerStyles.row,
                    active && { backgroundColor: palette.accentLight, borderRadius: 8 },
                    i !== SOUND_IDS.length - 1 && {
                      borderBottomColor: palette.glassBorder,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Text style={[pickerStyles.rowLabel, { color: palette.textDark, fontWeight: active ? '700' : '500' }]}>
                    {NOTIF_SOUND_LABELS[id]}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {previewable && (
                      <Pressable onPress={() => playPreview(id)} hitSlop={8}>
                        <Play size={16} color={palette.accent} strokeWidth={2} />
                      </Pressable>
                    )}
                    {active && <Check size={18} color={palette.accent} strokeWidth={2.5} />}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface MethodPickerProps {
  visible: boolean;
  currentId: MethodId;
  onSelect: (id: MethodId) => void;
  onClose: () => void;
  palette: ReturnType<typeof useTheme>['palette'];
}

function MethodPicker({ visible, currentId, onSelect, onClose, palette }: MethodPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pickerStyles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            pickerStyles.card,
            { backgroundColor: '#FFFFFF', borderRadius: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 10 },
          ]}
          onPress={() => {}}
        >
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              pickerStyles.cardBorderOverlay,
              { borderColor: palette.glassBorder },
            ]}
          />
          <View style={{ height: 3, width: 40, backgroundColor: palette.accent, borderRadius: 2, alignSelf: 'center', marginBottom: 12 }} />
          <Text style={[pickerStyles.title, { color: palette.textDark }]}>
            Calculation method
          </Text>
          <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
            {METHODS.map((m, i) => {
              const active = m.id === currentId;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => onSelect(m.id)}
                  style={({ pressed }) => [
                    pickerStyles.row,
                    active && { backgroundColor: palette.accentLight, borderRadius: 8 },
                    i !== METHODS.length - 1 && {
                      borderBottomColor: palette.glassBorder,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                    pressed && { opacity: 0.6 },
                    { alignItems: 'flex-start', flexDirection: 'column', gap: 2 },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Text
                      style={[
                        pickerStyles.rowLabel,
                        { color: palette.textDark, fontWeight: active ? '700' : '500' },
                      ]}
                    >
                      {m.label}
                    </Text>
                    {active ? (
                      <Check size={18} color={palette.accent} strokeWidth={2.5} />
                    ) : null}
                  </View>
                  <Text style={{ fontSize: 12, color: palette.textMid, lineHeight: 17 }}>
                    {m.description}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 12,
  },
  cardBorderOverlay: {
    borderWidth: 1,
    borderRadius: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  rowLabel: {
    fontSize: 14,
    flex: 1,
  },
});

interface LocationPickerProps {
  visible: boolean;
  onUseDevice: () => void;
  onSearch: () => void;
  onClose: () => void;
  palette: ReturnType<typeof useTheme>['palette'];
}

function LocationPickerModal({
  visible,
  onUseDevice,
  onSearch,
  onClose,
  palette,
}: LocationPickerProps) {
  const cardBg = palette.scheme === 'dark' ? palette.bgMid : '#FFFFFF';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pickerStyles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            pickerStyles.card,
            { backgroundColor: cardBg },
          ]}
          onPress={() => {}}
        >
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              pickerStyles.cardBorderOverlay,
              { borderColor: palette.glassBorder },
            ]}
          />
          <Text style={[pickerStyles.title, { color: palette.textDark }]}>
            Set location
          </Text>

          <Pressable
            onPress={onUseDevice}
            style={({ pressed }) => [
              locStyles.action,
              { backgroundColor: palette.accent },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={locStyles.actionText}>Use device location</Text>
          </Pressable>

          <Pressable
            onPress={onSearch}
            style={({ pressed }) => [
              locStyles.actionSecondary,
              { borderColor: palette.accent },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[locStyles.actionTextSecondary, { color: palette.accent }]}>
              Search for a city
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const locStyles = StyleSheet.create({
  action: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  actionSecondary: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 4,
  },
  actionTextSecondary: {
    fontWeight: '700',
    fontSize: 14,
  },
});

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
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  trailingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  themeBlock: {
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: 10,
  },
  swatchRow: {
    gap: 14,
    paddingHorizontal: 4,
  },
  swatchCol: {
    alignItems: 'center',
    width: 72,
  },
  swatchLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
    lineHeight: 14,
    height: 28,
    flexShrink: 1,
  },
  notifNote: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  notifNoteText: {
    fontSize: 12,
    lineHeight: 18,
  },
  rowTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chevronBtn: {
    padding: 2,
  },
  offsetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  offsetRowLast: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  offsetLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
