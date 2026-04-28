import * as Notifications from 'expo-notifications';
import type { CategoryId } from '@/types';
import type { NotifOffset } from '@/context/PrefsContext';
import {
  computeExtendedTimes,
  computeTomorrowFajr,
  computeCategoryWindows,
  type TimeWindow,
  type Coords,
  type MethodId,
  type Madhab,
} from '@/lib/prayer';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

const CATEGORY_LABELS: Record<CategoryId, string> = {
  all_day: 'All Day',
  fajr: 'Fajr',
  waking_up: 'Waking Up',
  morning: 'Morning',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  evening: 'Evening',
  maghrib: 'Maghrib',
  isha: 'Isha',
  witr: 'Witr',
  night: 'Night',
  before_bed: 'Before Bed',
};

const CATEGORY_SUBTITLES: Record<CategoryId, string> = {
  all_day: 'Anytime',
  fajr: 'Dawn prayer',
  waking_up: 'Upon awakening',
  morning: 'After Fajr prayer',
  dhuhr: 'Midday prayer',
  asr: 'Afternoon prayer',
  evening: 'After Asr prayer',
  maghrib: 'Sunset prayer',
  isha: 'Night prayer',
  witr: 'Night prayer supplication',
  night: 'Before sleep',
  before_bed: 'Sleeping dua',
};

const PRAYER_OFFSET_IDS: ReadonlySet<CategoryId> = new Set([
  'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'witr',
]);

const addMinutesToDate = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * 60 * 1000);

export const scheduleAllNotifications = async (
  notifEnabled: Record<CategoryId, boolean>,
  notifOffset: Partial<Record<CategoryId, NotifOffset>>,
  coords: Coords | null,
  methodId: MethodId,
  madhab: Madhab,
  wakingUpMinutes: number,
  beforeBedMinutes: number,
): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!coords) return;

  const now = new Date();

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + dayOffset);
    targetDate.setHours(0, 0, 0, 0);

    const ext = computeExtendedTimes(coords, targetDate, methodId, madhab);
    const tomorrowFajr = computeTomorrowFajr(coords, targetDate, methodId, madhab);
    const windows = computeCategoryWindows(ext, tomorrowFajr, wakingUpMinutes, beforeBedMinutes);

    const categoryIds = Object.keys(notifEnabled) as CategoryId[];
    for (const id of categoryIds) {
      if (!notifEnabled[id]) continue;
      const win: TimeWindow | undefined = windows[id];
      if (!win) continue;

      const offset = PRAYER_OFFSET_IDS.has(id) ? (notifOffset[id] ?? 0) : 0;
      const triggerTime = addMinutesToDate(win.start, offset);

      if (triggerTime <= now && dayOffset === 0) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for ${CATEGORY_LABELS[id]} Dhikr`,
          body: CATEGORY_SUBTITLES[id],
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerTime,
        },
      });
    }
  }
};
