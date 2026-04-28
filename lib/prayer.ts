import {
  CalculationMethod,
  Coordinates,
  Madhab as AdhanMadhab,
  PrayerTimes,
  type CalculationParameters,
} from 'adhan';
import type { CategoryId } from '@/types';

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
  | 'Tehran';

export const DEFAULT_METHOD: MethodId = 'MWL';

export interface PrayerMethodEntry {
  id: MethodId;
  label: string;
  build: () => CalculationParameters;
}

export const METHODS: PrayerMethodEntry[] = [
  { id: 'MWL', label: 'Muslim World League', build: () => CalculationMethod.MuslimWorldLeague() },
  { id: 'ISNA', label: 'Islamic Society of N. America', build: () => CalculationMethod.NorthAmerica() },
  { id: 'Egyptian', label: 'Egyptian General Authority', build: () => CalculationMethod.Egyptian() },
  { id: 'Karachi', label: 'University of Islamic Sciences, Karachi', build: () => CalculationMethod.Karachi() },
  { id: 'UmmAlQura', label: 'Umm al-Qura, Makkah', build: () => CalculationMethod.UmmAlQura() },
  { id: 'Dubai', label: 'Dubai', build: () => CalculationMethod.Dubai() },
  { id: 'Qatar', label: 'Qatar', build: () => CalculationMethod.Qatar() },
  { id: 'Kuwait', label: 'Kuwait', build: () => CalculationMethod.Kuwait() },
  { id: 'Singapore', label: 'Singapore', build: () => CalculationMethod.Singapore() },
  { id: 'Tehran', label: 'Tehran', build: () => CalculationMethod.Tehran() },
];

export const getMethod = (id: MethodId): PrayerMethodEntry =>
  METHODS.find((m) => m.id === id) ?? METHODS[0];

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
  const params = getMethod(methodId).build();
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
  const params = getMethod(methodId).build();
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
