import {
  CalculationMethod,
  Coordinates,
  Madhab as AdhanMadhab,
  PrayerTimes,
  type CalculationParameters,
} from 'adhan';
import type { CategoryId } from '@/types';
import elmData from '@/data/elm-prayer-times.json';

export type Madhab = 'shafi' | 'hanafi';

export type MethodId =
  | 'MWL'
  | 'ISNA'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'Singapore'
  | 'Tehran'
  | 'ELM';

export const DEFAULT_METHOD: MethodId = 'MWL';

export interface PrayerMethodEntry {
  id: MethodId;
  label: string;
  description: string;
  build?: () => CalculationParameters;
}

export const METHODS: PrayerMethodEntry[] = [
  {
    id: 'ELM',
    label: 'East London Mosque',
    description: 'Fixed timetable from the East London Mosque, London E1. Based on the London Unified Prayer Timetable.',
  },
  {
    id: 'MWL',
    label: 'Muslim World League',
    description: 'Fajr 18°, Isha 17°. Recommended for Europe, Far East, and parts of the Americas.',
    build: () => CalculationMethod.MuslimWorldLeague(),
  },
  {
    id: 'ISNA',
    label: 'Islamic Society of N. America',
    description: 'Fajr 15°, Isha 15°. Standard method for the United States and Canada.',
    build: () => CalculationMethod.NorthAmerica(),
  },
  {
    id: 'Egyptian',
    label: 'Egyptian General Authority',
    description: 'Fajr 19.5°, Isha 17.5°. Used across Egypt, Africa, and parts of the Middle East.',
    build: () => CalculationMethod.Egyptian(),
  },
  {
    id: 'Karachi',
    label: 'University of Islamic Sciences, Karachi',
    description: 'Fajr 18°, Isha 18°. Widely followed in Pakistan, India, Bangladesh, and Afghanistan.',
    build: () => CalculationMethod.Karachi(),
  },
  {
    id: 'UmmAlQura',
    label: 'Umm al-Qura, Makkah',
    description: 'Fajr 18.5°, Isha fixed 90 min after Maghrib. Official method of Saudi Arabia.',
    build: () => CalculationMethod.UmmAlQura(),
  },
  {
    id: 'Dubai',
    label: 'Dubai',
    description: 'Fajr 18.2°, Isha 18.2°. Official method used across the United Arab Emirates.',
    build: () => CalculationMethod.Dubai(),
  },
  {
    id: 'Qatar',
    label: 'Qatar',
    description: 'Fajr 18°, Isha fixed 90 min after Maghrib. Official method of the State of Qatar.',
    build: () => CalculationMethod.Qatar(),
  },
  {
    id: 'Kuwait',
    label: 'Kuwait',
    description: 'Fajr 18°, Isha 17.5°. Official method used in the State of Kuwait.',
    build: () => CalculationMethod.Kuwait(),
  },
  {
    id: 'Singapore',
    label: 'Singapore',
    description: 'Fajr 20°, Isha 18°. Method established by MUIS for Singapore and surrounding region.',
    build: () => CalculationMethod.Singapore(),
  },
  {
    id: 'Tehran',
    label: 'Tehran',
    description: 'Fajr 17.7°, Isha 14°. Institute of Geophysics, Tehran. Used in Iran and some Shia communities.',
    build: () => CalculationMethod.Tehran(),
  },
];

export const getMethod = (id: MethodId): PrayerMethodEntry =>
  METHODS.find((m) => m.id === id) ?? METHODS[0];

const elmTimeData = elmData as Record<string, {
  fajr: string; sunrise: string; dhuhr: string;
  asrShafi: string; asrHanafi: string; maghrib: string; isha: string;
}>;

const lookupELMTimes = (date: Date, madhab: Madhab): ExtendedPrayerTimes => {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  let key = `${mm}-${dd}`;
  // Fallback for Feb 29 in leap years (timetable only covers 2026)
  if (!elmTimeData[key]) {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    const pm = String(prev.getMonth() + 1).padStart(2, '0');
    const pd = String(prev.getDate()).padStart(2, '0');
    key = `${pm}-${pd}`;
  }
  const e = elmTimeData[key];
  const at = (t: string): Date => {
    const [h, m] = t.split(':').map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
  };
  return {
    fajr: at(e.fajr),
    sunrise: at(e.sunrise),
    dhuhr: at(e.dhuhr),
    asr: madhab === 'hanafi' ? at(e.asrHanafi) : at(e.asrShafi),
    maghrib: at(e.maghrib),
    isha: at(e.isha),
  };
};

export interface Coords {
  lat: number;
  lon: number;
}

export const computePrayerTimes = (
  coords: Coords,
  date: Date,
  methodId: MethodId,
  madhab: Madhab,
): Map<CategoryId, Date> => {
  if (methodId === 'ELM') {
    const ext = lookupELMTimes(date, madhab);
    return new Map<CategoryId, Date>([
      ['fajr', ext.fajr],
      ['dhuhr', ext.dhuhr],
      ['asr', ext.asr],
      ['maghrib', ext.maghrib],
      ['isha', ext.isha],
    ]);
  }
  const params = getMethod(methodId).build!();
  params.madhab = madhab === 'hanafi' ? AdhanMadhab.Hanafi : AdhanMadhab.Shafi;
  const c = new Coordinates(coords.lat, coords.lon);
  const t = new PrayerTimes(c, date, params);
  return new Map<CategoryId, Date>([
    ['fajr', t.fajr],
    ['dhuhr', t.dhuhr],
    ['asr', t.asr],
    ['maghrib', t.maghrib],
    ['isha', t.isha],
  ]);
};

export interface ExtendedPrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export const computeExtendedTimes = (
  coords: Coords,
  date: Date,
  methodId: MethodId,
  madhab: Madhab,
): ExtendedPrayerTimes => {
  if (methodId === 'ELM') return lookupELMTimes(date, madhab);
  const params = getMethod(methodId).build!();
  params.madhab = madhab === 'hanafi' ? AdhanMadhab.Hanafi : AdhanMadhab.Shafi;
  const c = new Coordinates(coords.lat, coords.lon);
  const t = new PrayerTimes(c, date, params);
  return { fajr: t.fajr, sunrise: t.sunrise, dhuhr: t.dhuhr, asr: t.asr, maghrib: t.maghrib, isha: t.isha };
};

export const computeTomorrowFajr = (
  coords: Coords,
  today: Date,
  methodId: MethodId,
  madhab: Madhab,
): Date => {
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const ext = computeExtendedTimes(coords, tomorrow, methodId, madhab);
  return ext.fajr;
};

export const formatPrayerTime = (date: Date): string => {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

export interface TimeWindow {
  startLabel: string;
  endLabel: string;
  start: Date;
  end: Date;
}

const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

const todayAtMinutes = (minutesFromMidnight: number): Date => {
  const d = new Date();
  d.setHours(Math.floor(minutesFromMidnight / 60), minutesFromMidnight % 60, 0, 0);
  return d;
};

const midnight = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (): Date => {
  const d = new Date();
  d.setHours(23, 59, 0, 0);
  return d;
};

const midpoint = (a: Date, b: Date): Date =>
  new Date((a.getTime() + b.getTime()) / 2);

const makeWindow = (start: Date, end: Date): TimeWindow => ({
  start,
  end,
  startLabel: formatPrayerTime(start),
  endLabel: formatPrayerTime(end),
});

export const computeCategoryWindows = (
  times: ExtendedPrayerTimes,
  tomorrowFajr: Date,
  wakingUpMinutes: number,
  beforeBedMinutes: number,
): Partial<Record<CategoryId, TimeWindow>> => {
  const wakingStart = todayAtMinutes(wakingUpMinutes);
  const beforeBedStart = todayAtMinutes(beforeBedMinutes);
  const ishaToFajrMid = midpoint(times.isha, tomorrowFajr);

  return {
    all_day: makeWindow(midnight(), endOfDay()),
    fajr: makeWindow(times.fajr, times.sunrise),
    waking_up: makeWindow(wakingStart, addMinutes(wakingStart, 60)),
    morning: makeWindow(times.sunrise, times.asr),
    dhuhr: makeWindow(times.dhuhr, times.asr),
    asr: makeWindow(times.asr, times.maghrib),
    evening: makeWindow(times.asr, times.isha),
    maghrib: makeWindow(times.maghrib, times.isha),
    isha: makeWindow(times.isha, ishaToFajrMid),
    witr: makeWindow(times.isha, ishaToFajrMid),
    night: makeWindow(times.isha, tomorrowFajr),
    before_bed: makeWindow(beforeBedStart, addMinutes(beforeBedStart, 60)),
  };
};
