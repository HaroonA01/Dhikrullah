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

export const formatPrayerTime = (date: Date): string => {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};
