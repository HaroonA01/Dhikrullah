import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'all_day', label: 'All Day', order: 0 },
  { id: 'fajr', label: 'Fajr', order: 1 },
  { id: 'morning', label: 'Morning', order: 2 },
  { id: 'waking_up', label: 'Waking Up', order: 3 },
  { id: 'dhuhr', label: 'Dhuhr', order: 4 },
  { id: 'asr', label: 'Asr', order: 5 },
  { id: 'evening', label: 'Evening', order: 6 },
  { id: 'maghrib', label: 'Maghrib', order: 7 },
  { id: 'isha', label: 'Isha', order: 8 },
  { id: 'before_bed', label: 'Before Bed', order: 9 },
];
