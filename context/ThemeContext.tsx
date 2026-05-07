import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  DEFAULT_THEME_ID,
  getTheme,
  THEMES,
  SPECIAL_THEMES,
  getSpecialTheme,
  resolveSpecialPalette,
  type Palette,
  type Theme,
  type SpecialTheme,
  type SpecialPalette,
} from '@/constants/themes';
import { getMeta, setMeta } from '@/db/queries';

export type Mode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: Mode;
  themeId: string;
  palette: Palette;
  themes: Theme[];
  isDark: boolean;
  setMode: (m: Mode) => void;
  setThemeId: (id: string) => void;
  // special themes
  specialThemes: SpecialTheme[];
  visibleSpecialThemes: SpecialTheme[];
  activeSpecialTheme: SpecialTheme | null;
  resolvedSpecialPalette: SpecialPalette | null;
  unlockedSpecialIds: string[];
  hiddenSpecialIds: string[];
  unlockSpecialTheme: (id: string) => void;
  hideSpecialTheme: (id: string) => void;
  setActiveSpecialTheme: (id: string | null) => void;
}

const KEY_MODE = 'prefs.themeMode';
const KEY_THEME = 'prefs.themeId';
const KEY_UNLOCKED_SPECIAL = 'prefs.unlockedSpecialThemes';
const KEY_HIDDEN_SPECIAL = 'prefs.hiddenSpecialThemes';
const KEY_ACTIVE_SPECIAL = 'prefs.activeSpecialThemeId';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useColorScheme();
  const [mode, setModeState] = useState<Mode>('system');
  const [themeId, setThemeIdState] = useState<string>(DEFAULT_THEME_ID);
  const [unlockedSpecialIds, setUnlockedSpecialIds] = useState<string[]>([]);
  const [hiddenSpecialIds, setHiddenSpecialIds] = useState<string[]>([]);
  const [activeSpecialId, setActiveSpecialIdState] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, t, unlocked, hidden, activeSpecial] = await Promise.all([
          getMeta(KEY_MODE),
          getMeta(KEY_THEME),
          getMeta(KEY_UNLOCKED_SPECIAL),
          getMeta(KEY_HIDDEN_SPECIAL),
          getMeta(KEY_ACTIVE_SPECIAL),
        ]);
        if (cancelled) return;
        if (m === 'light' || m === 'dark' || m === 'system') setModeState(m);
        if (t) setThemeIdState(t);
        if (unlocked) {
          try { setUnlockedSpecialIds(JSON.parse(unlocked)); } catch { /* ignore */ }
        }
        if (hidden) {
          try { setHiddenSpecialIds(JSON.parse(hidden)); } catch { /* ignore */ }
        }
        if (activeSpecial) setActiveSpecialIdState(activeSpecial || null);
      } catch {
        // db not ready yet on first launch — defaults stay
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    setMeta(KEY_MODE, m).catch(() => {});
  }, []);

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id);
    setActiveSpecialIdState(null);
    setMeta(KEY_THEME, id).catch(() => {});
    setMeta(KEY_ACTIVE_SPECIAL, '').catch(() => {});
  }, []);

  const unlockSpecialTheme = useCallback((id: string) => {
    setUnlockedSpecialIds(prev => {
      const next = prev.includes(id) ? prev : [...prev, id];
      setMeta(KEY_UNLOCKED_SPECIAL, JSON.stringify(next)).catch(() => {});
      return next;
    });
    setHiddenSpecialIds(prev => {
      const next = prev.filter(h => h !== id);
      setMeta(KEY_HIDDEN_SPECIAL, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const hideSpecialTheme = useCallback((id: string) => {
    setHiddenSpecialIds(prev => {
      const next = prev.includes(id) ? prev : [...prev, id];
      setMeta(KEY_HIDDEN_SPECIAL, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setActiveSpecialTheme = useCallback((id: string | null) => {
    setActiveSpecialIdState(id);
    setMeta(KEY_ACTIVE_SPECIAL, id ?? '').catch(() => {});
  }, []);

  const activeSpecialTheme = useMemo<SpecialTheme | null>(() => {
    if (!activeSpecialId) return null;
    const theme = getSpecialTheme(activeSpecialId) ?? null;
    if (!theme?.paletteVariants?.length) return theme;
    const variant = theme.paletteVariants[Math.floor(Math.random() * theme.paletteVariants.length)];
    return {
      ...theme,
      palette: variant.palette,
      lightPalette: variant.lightPalette,
      darkPalette: variant.darkPalette,
    };
  }, [activeSpecialId]);

  const visibleSpecialThemes = useMemo<SpecialTheme[]>(
    () => SPECIAL_THEMES.filter(
      t => t.debug || (unlockedSpecialIds.includes(t.id) && !hiddenSpecialIds.includes(t.id)),
    ),
    [unlockedSpecialIds, hiddenSpecialIds],
  );

  const isDark = useMemo(
    () => mode === 'dark' || (mode === 'system' && system === 'dark'),
    [mode, system],
  );

  const resolvedSpecialPalette = useMemo<SpecialPalette | null>(
    () => activeSpecialTheme ? resolveSpecialPalette(activeSpecialTheme, isDark) : null,
    [activeSpecialTheme, isDark],
  );

  const palette = useMemo<Palette>(() => {
    if (activeSpecialTheme && resolvedSpecialPalette) {
      const sp = resolvedSpecialPalette;
      const colors = sp.gradientColors;
      return {
        scheme: isDark ? 'dark' : 'light',
        accent: sp.accent,
        accentLight: sp.accentLight,
        glassBg: sp.glassBg,
        glassBorder: sp.glassBorder,
        textDark: sp.textDark,
        textMid: sp.textMid,
        textDim: sp.textDim,
        bgTop: colors[0],
        bgMid: colors[Math.floor(colors.length / 2)],
        bgBottom: colors[colors.length - 1],
      };
    }
    const theme = getTheme(themeId);
    return isDark ? theme.dark : theme.light;
  }, [isDark, themeId, activeSpecialTheme, resolvedSpecialPalette]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      themeId,
      palette,
      themes: THEMES,
      isDark,
      setMode,
      setThemeId,
      specialThemes: SPECIAL_THEMES,
      visibleSpecialThemes,
      activeSpecialTheme,
      resolvedSpecialPalette,
      unlockedSpecialIds,
      hiddenSpecialIds,
      unlockSpecialTheme,
      hideSpecialTheme,
      setActiveSpecialTheme,
    }),
    [
      mode, themeId, palette, isDark, setMode, setThemeId,
      visibleSpecialThemes, activeSpecialTheme, resolvedSpecialPalette,
      unlockedSpecialIds, hiddenSpecialIds,
      unlockSpecialTheme, hideSpecialTheme, setActiveSpecialTheme,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
