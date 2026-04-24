export type CategoryId =
  | 'morning'
  | 'evening'
  | 'night'
  | 'fajr'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha';

export interface Category {
  id: CategoryId;
  label: string;
  order: number;
}

export interface Dhikr {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  target: number;
}

export interface CounterState {
  currentDhikrIndex: number;
  counts: Record<string, number>;
}

export interface Quote {
  text: string;
  source?: string;
}
