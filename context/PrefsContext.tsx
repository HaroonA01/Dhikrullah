import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getMeta, setMeta } from '@/db/queries';
import { setHapticPrefs } from '@/lib/haptics';
import {
  computePrayerTimes,
  DEFAULT_METHOD,
  type Madhab,
  type MethodId,
} from '@/lib/prayer';
import type { LocationData } from '@/lib/location';
import type { CategoryId } from '@/types';

const KEY_HAPTIC_INDIV = 'prefs.hapticsIndividual';
const KEY_HAPTIC_COMPLETE = 'prefs.hapticsComplete';
const KEY_PRAYER_METHOD = 'prefs.prayerMethod';
const KEY_PRAYER_MADHAB = 'prefs.prayerMadhab';
const KEY_LOCATION = 'prefs.location';
const KEY_LOC_PROMPT_SHOWN = 'prefs.locationPromptShown';

interface PrefsContextValue {
  hydrated: boolean;
  hapticsIndividual: boolean;
  hapticsComplete: boolean;
  setHapticsIndividual: (v: boolean) => void;
  setHapticsComplete: (v: boolean) => void;
  prayerMethodId: MethodId;
  setPrayerMethodId: (id: MethodId) => void;
  madhab: Madhab;
  setMadhab: (m: Madhab) => void;
  location: LocationData | null;
  setLocation: (loc: LocationData | null) => void;
  locationPromptShown: boolean;
  markLocationPromptShown: () => void;
}

const PrefsContext = createContext<PrefsContextValue | null>(null);

export const PrefsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hydrated, setHydrated] = useState(false);
  const [hapticsIndividual, setHI] = useState(true);
  const [hapticsComplete, setHC] = useState(true);
  const [prayerMethodId, setPM] = useState<MethodId>(DEFAULT_METHOD);
  const [madhab, setMad] = useState<Madhab>('shafi');
  const [location, setLoc] = useState<LocationData | null>(null);
  const [locationPromptShown, setLPS] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const tryHydrate = async () => {
      attempts += 1;
      try {
        const [hi, hc, pm, mad, locStr, lps] = await Promise.all([
          getMeta(KEY_HAPTIC_INDIV),
          getMeta(KEY_HAPTIC_COMPLETE),
          getMeta(KEY_PRAYER_METHOD),
          getMeta(KEY_PRAYER_MADHAB),
          getMeta(KEY_LOCATION),
          getMeta(KEY_LOC_PROMPT_SHOWN),
        ]);
        if (cancelled) return;
        const hiVal = hi !== '0';
        const hcVal = hc !== '0';
        setHI(hiVal);
        setHC(hcVal);
        setHapticPrefs({ individual: hiVal, complete: hcVal });
        if (pm) setPM(pm as MethodId);
        if (mad === 'shafi' || mad === 'hanafi') setMad(mad);
        if (locStr) {
          try {
            const parsed = JSON.parse(locStr) as LocationData;
            if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
              setLoc(parsed);
            }
          } catch {}
        }
        if (lps === '1') setLPS(true);
        setHydrated(true);
      } catch {
        if (cancelled || attempts >= 20) {
          if (!cancelled) setHydrated(true);
          return;
        }
        setTimeout(tryHydrate, 200);
      }
    };
    tryHydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const setHapticsIndividual = useCallback((v: boolean) => {
    setHI(v);
    setHapticPrefs({ individual: v });
    setMeta(KEY_HAPTIC_INDIV, v ? '1' : '0').catch(() => {});
  }, []);

  const setHapticsComplete = useCallback((v: boolean) => {
    setHC(v);
    setHapticPrefs({ complete: v });
    setMeta(KEY_HAPTIC_COMPLETE, v ? '1' : '0').catch(() => {});
  }, []);

  const setPrayerMethodId = useCallback((id: MethodId) => {
    setPM(id);
    setMeta(KEY_PRAYER_METHOD, id).catch(() => {});
  }, []);

  const setMadhab = useCallback((m: Madhab) => {
    setMad(m);
    setMeta(KEY_PRAYER_MADHAB, m).catch(() => {});
  }, []);

  const setLocation = useCallback((loc: LocationData | null) => {
    setLoc(loc);
    setMeta(KEY_LOCATION, loc ? JSON.stringify(loc) : '').catch(() => {});
  }, []);

  const markLocationPromptShown = useCallback(() => {
    setLPS(true);
    setMeta(KEY_LOC_PROMPT_SHOWN, '1').catch(() => {});
  }, []);

  const value = useMemo<PrefsContextValue>(
    () => ({
      hydrated,
      hapticsIndividual,
      hapticsComplete,
      setHapticsIndividual,
      setHapticsComplete,
      prayerMethodId,
      setPrayerMethodId,
      madhab,
      setMadhab,
      location,
      setLocation,
      locationPromptShown,
      markLocationPromptShown,
    }),
    [
      hydrated,
      hapticsIndividual,
      hapticsComplete,
      prayerMethodId,
      madhab,
      location,
      locationPromptShown,
      setHapticsIndividual,
      setHapticsComplete,
      setPrayerMethodId,
      setMadhab,
      setLocation,
      markLocationPromptShown,
    ],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
};

export const usePrefs = (): PrefsContextValue => {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used inside PrefsProvider');
  return ctx;
};

export const usePrayerTimes = (): Map<CategoryId, Date> | null => {
  const { location, prayerMethodId, madhab } = usePrefs();
  const [dayKey, setDayKey] = useState<string>(() => new Date().toDateString());

  useEffect(() => {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 5, 0);
    const ms = Math.max(1000, next.getTime() - now.getTime());
    const t = setTimeout(() => setDayKey(new Date().toDateString()), ms);
    return () => clearTimeout(t);
  }, [dayKey]);

  return useMemo(() => {
    if (!location) return null;
    return computePrayerTimes(location, new Date(), prayerMethodId, madhab);
  }, [location, prayerMethodId, madhab, dayKey]);
};
