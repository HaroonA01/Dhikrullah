import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { DEFAULT_THEME_ID, getTheme, THEMES, type Palette, type Theme } from '@/constants/themes';
import { getMeta, setMeta } from '@/db/queries';

export type Mode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: Mode;
  themeId: string;
  palette: Palette;
  themes: Theme[];
  setMode: (m: Mode) => void;
  setThemeId: (id: string) => void;
}

const KEY_MODE = 'prefs.themeMode';
const KEY_THEME = 'prefs.themeId';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useColorScheme();
  const [mode, setModeState] = useState<Mode>('system');
  const [themeId, setThemeIdState] = useState<string>(DEFAULT_THEME_ID);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [m, t] = await Promise.all([getMeta(KEY_MODE), getMeta(KEY_THEME)]);
        if (cancelled) return;
        if (m === 'light' || m === 'dark' || m === 'system') setModeState(m);
        if (t) setThemeIdState(t);
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
    setMeta(KEY_THEME, id).catch(() => {});
  }, []);

  const palette = useMemo<Palette>(() => {
    const theme = getTheme(themeId);
    const scheme: 'light' | 'dark' =
      mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
    return scheme === 'dark' ? theme.dark : theme.light;
  }, [mode, themeId, system]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, themeId, palette, themes: THEMES, setMode, setThemeId }),
    [mode, themeId, palette, setMode, setThemeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
