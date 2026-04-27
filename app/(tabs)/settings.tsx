import { useEffect, useState } from 'react';
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
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Check,
  ChevronRight,
  Compass,
  Mail,
  MapPin,
  Palette as PaletteIcon,
  Scale,
  Sparkles,
  SunMoon,
  Tag,
  Vibrate,
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
import { usePrefs } from '@/context/PrefsContext';
import { METHODS, type Madhab, type MethodId } from '@/lib/prayer';
import { requestDeviceLocation, type LocationData } from '@/lib/location';
import { FEEDBACK_SUBJECT, SUPPORT_EMAIL } from '@/constants/about';

const MODES: { id: Mode; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

const MADHABS: { id: Madhab; label: string }[] = [
  { id: 'shafi', label: 'Shafi' },
  { id: 'hanafi', label: 'Hanafi' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { palette, mode, setMode, themeId, setThemeId, themes } = useTheme();
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
  } = usePrefs();

  const [methodPickerOpen, setMethodPickerOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const currentMethod = METHODS.find((m) => m.id === prayerMethodId) ?? METHODS[0];
  const currentTheme = themes.find((t) => t.id === themeId) ?? themes[0];

  const useDeviceLocation = async () => {
    const result = await requestDeviceLocation();
    if (!result) {
      Alert.alert(
        'Location unavailable',
        'Permission denied or location lookup failed. Try searching for your city instead.',
      );
      return;
    }
    setLocation(result);
    setLocationPickerOpen(false);
  };

  const handleCitySelect = (loc: LocationData) => {
    setLocation(loc);
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
                {currentTheme.name}
              </Text>
            }
            isLast
          />
          <ThemeRow
            themes={themes}
            themeId={themeId}
            setThemeId={setThemeId}
            palette={palette}
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

        <SettingsSection title="About">
          <SettingsRow label="Version" detail={version} Icon={Tag} />
          <SettingsRow
            label="Contact"
            detail={SUPPORT_EMAIL}
            Icon={Mail}
            showChevron
            onPress={openContact}
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
    </View>
  );
}

interface ThemeRowProps {
  themes: ReturnType<typeof useTheme>['themes'];
  themeId: string;
  setThemeId: (id: string) => void;
  palette: ReturnType<typeof useTheme>['palette'];
}

function ThemeRow({ themes, themeId, setThemeId, palette }: ThemeRowProps) {
  const [scrollX, setScrollX] = useState(0);
  const [contentW, setContentW] = useState(0);
  const [layoutW, setLayoutW] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  const showLeftFade = scrollX > 8;
  const showRightFade = layoutW > 0 && scrollX < contentW - layoutW - 8;

  const bounce = useSharedValue(0);
  const arrowOpacity = useSharedValue(1);
  useEffect(() => {
    if (hasScrolled) {
      bounce.value = withTiming(0, { duration: 200 });
      arrowOpacity.value = withTiming(0, { duration: 220 });
      return;
    }
    arrowOpacity.value = withTiming(1, { duration: 200 });
    bounce.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 600 }),
        withTiming(0, { duration: 600 }),
      ),
      -1,
      false,
    );
  }, [hasScrolled, bounce, arrowOpacity]);

  const bounceStyle = useAnimatedStyle(() => ({
    opacity: arrowOpacity.value,
    transform: [{ translateX: bounce.value }],
  }));

  const fadeColor = palette.bgMid;

  return (
    <View style={styles.themeBlock}>
      <View style={fadeStyles.scrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.swatchRow}
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            setScrollX(x);
            if (!hasScrolled && x > 4) setHasScrolled(true);
          }}
          scrollEventThrottle={16}
          onContentSizeChange={(w) => setContentW(w)}
          onLayout={(e) => setLayoutW(e.nativeEvent.layout.width)}
        >
          {themes.map((t) => (
            <View key={t.id} style={styles.swatchCol}>
              <ThemeSwatch
                theme={t}
                selected={t.id === themeId}
                onPress={() => setThemeId(t.id)}
              />
              <Text
                style={[
                  styles.swatchLabel,
                  {
                    color: t.id === themeId ? palette.accent : palette.textMid,
                    fontWeight: t.id === themeId ? '700' : '500',
                  },
                ]}
              >
                {t.name.replace(' ', '\n')}
              </Text>
            </View>
          ))}
        </ScrollView>

        {showLeftFade ? (
          <LinearGradient
            colors={[fadeColor, `${fadeColor}00`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={fadeStyles.fadeLeft}
            pointerEvents="none"
          />
        ) : null}

        {showRightFade ? (
          <>
            <LinearGradient
              colors={[`${fadeColor}00`, fadeColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={fadeStyles.fadeRight}
              pointerEvents="none"
            />
            <Animated.View
              style={[fadeStyles.chevron, bounceStyle]}
              pointerEvents="none"
            >
              <ChevronRight size={20} color={palette.accent} strokeWidth={2.5} />
            </Animated.View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const fadeStyles = StyleSheet.create({
  scrollWrap: {
    position: 'relative',
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 28,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 36,
  },
  chevron: {
    position: 'absolute',
    right: 6,
    top: 22,
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

interface MethodPickerProps {
  visible: boolean;
  currentId: MethodId;
  onSelect: (id: MethodId) => void;
  onClose: () => void;
  palette: ReturnType<typeof useTheme>['palette'];
}

function MethodPicker({ visible, currentId, onSelect, onClose, palette }: MethodPickerProps) {
  const cardBg = palette.scheme === 'dark' ? palette.bgMid : '#FFFFFF';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={pickerStyles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            pickerStyles.card,
            { backgroundColor: cardBg, borderColor: palette.glassBorder },
          ]}
          onPress={() => {}}
        >
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
                    i !== METHODS.length - 1 && {
                      borderBottomColor: palette.glassBorder,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                    pressed && { opacity: 0.6 },
                  ]}
                >
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
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 12,
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
            { backgroundColor: cardBg, borderColor: palette.glassBorder },
          ]}
          onPress={() => {}}
        >
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
    paddingRight: 8,
    paddingLeft: 4,
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
});
