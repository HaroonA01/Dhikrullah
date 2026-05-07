import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { CategoryId } from '@/types';
import type { NotifOffset } from '@/context/PrefsContext';
import type { NotifSoundId } from '@/lib/soundMap';
import {
  computeExtendedTimes,
  computeTomorrowFajr,
  computeCategoryWindows,
  type TimeWindow,
  type Coords,
  type MethodId,
  type Madhab,
} from '@/lib/prayer';

let _soundEnabled = true;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: _soundEnabled,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

const CATEGORY_MESSAGES: Record<CategoryId, Array<{ title: string; body: string }>> = {
  all_day: [
    { title: 'Time for Dhikr', body: 'Make every moment a moment of remembrance' },
    { title: 'Dhikr Reminder', body: 'Keep your tongue moist with the dhikr of Allah' },
    { title: 'Remember Allah', body: 'Whoever remembers Allah often, Allah will love them' },
    { title: 'Time for Dhikr', body: 'A few moments of remembrance brings peace to the heart' },
  ],
  fajr: [
    { title: 'Time for Fajr Dhikr', body: 'Dawn is the best time to remember Allah' },
    { title: 'Fajr Dhikr Reminder', body: 'Begin your day with the remembrance of Allah' },
    { title: 'Time for Fajr Dhikr', body: 'The Prophet ﷺ never missed his morning adhkar' },
    { title: 'Fajr Adhkar', body: 'Morning adhkar bring barakah to your entire day' },
  ],
  waking_up: [
    { title: 'Time to Wake with Dhikr', body: 'Start the day as the Prophet ﷺ did — with dhikr' },
    { title: 'Waking Up Dhikr', body: 'Gratitude begins the moment you open your eyes' },
    { title: 'Morning Dhikr Reminder', body: 'Say Alhamdulillah — you have been given another day' },
    { title: 'Rise with Dhikr', body: 'The du\'a upon waking is your morning shield' },
  ],
  morning: [
    { title: 'Time for Morning Dhikr', body: 'Protect your day with morning adhkar' },
    { title: 'Morning Adhkar Reminder', body: 'Morning dhikr is a fortress for your soul' },
    { title: 'Time for Morning Dhikr', body: 'The Prophet ﷺ was consistent with morning remembrance' },
    { title: 'Morning Dhikr', body: 'Lock in barakah for the day with your morning adhkar' },
  ],
  dhuhr: [
    { title: 'Time for Dhuhr Dhikr', body: 'Pause at midday and remember Allah' },
    { title: 'Dhuhr Dhikr Reminder', body: 'Return your heart to Allah at the midpoint of the day' },
    { title: 'Time for Dhuhr Dhikr', body: 'Midday is a moment of gratitude and remembrance' },
    { title: 'Dhuhr Dhikr', body: 'Reconnect with Allah before the rest of the day continues' },
  ],
  asr: [
    { title: 'Time for Asr Dhikr', body: 'Allah swears by the afternoon — do not neglect it' },
    { title: 'Asr Dhikr Reminder', body: 'A moment of dhikr before the day winds down' },
    { title: 'Time for Asr Dhikr', body: 'Protect the remainder of your day with dhikr' },
    { title: 'Asr Dhikr', body: 'Return to remembrance as the afternoon light fades' },
  ],
  evening: [
    { title: 'Time for Evening Dhikr', body: 'Shield your evening with adhkar' },
    { title: 'Evening Adhkar Reminder', body: 'Evening dhikr protects you until the morning' },
    { title: 'Time for Evening Dhikr', body: 'End the day\'s work with the remembrance of Allah' },
    { title: 'Evening Dhikr', body: 'Consistent evening adhkar is the mark of a believer' },
  ],
  maghrib: [
    { title: 'Time for Maghrib Dhikr', body: 'Greet the sunset with gratitude and dhikr' },
    { title: 'Maghrib Dhikr Reminder', body: 'As the sun sets, rise in the remembrance of Allah' },
    { title: 'Time for Maghrib Dhikr', body: 'Post-Maghrib adhkar — do not let the moment pass' },
    { title: 'Maghrib Dhikr', body: 'Sunset marks the door between day and night — mark it with dhikr' },
  ],
  isha: [
    { title: 'Time for Isha Dhikr', body: 'Night has fallen — remember Allah before you sleep' },
    { title: 'Isha Dhikr Reminder', body: 'Close your evening with the remembrance of Allah' },
    { title: 'Time for Isha Dhikr', body: 'Night dhikr brings peace and forgiveness' },
    { title: 'Isha Dhikr', body: 'The night belongs to worship — begin with dhikr' },
  ],
  witr: [
    { title: 'Time for Witr Dhikr', body: 'Witr is the seal of the night prayer' },
    { title: 'Witr Dhikr Reminder', body: 'End the night as the Prophet ﷺ ended his' },
    { title: 'Time for Witr Dhikr', body: 'The last act before sleep — make it a good one' },
    { title: 'Witr Dhikr', body: 'Seal your night with supplication and dhikr' },
  ],
  before_bed: [
    { title: 'Time for Bedtime Dhikr', body: 'Sleep with the name of Allah on your lips' },
    { title: 'Bedtime Du\'a Reminder', body: 'The Prophet ﷺ never slept without his bedtime adhkar' },
    { title: 'Time for Bedtime Dhikr', body: 'End the day with gratitude and remembrance' },
    { title: 'Sleeping Du\'a', body: 'Recite your sleeping adhkar to be protected through the night' },
  ],
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
  notifSound: NotifSoundId,
): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  _soundEnabled = notifSound !== 'none';

  if (!coords) return;

  const soundValue: boolean | string =
    notifSound === 'none'    ? false
  : notifSound === 'default' ? true
  : Platform.OS === 'android' ? notifSound
  : `${notifSound}.wav`;

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

      const msgs = CATEGORY_MESSAGES[id];
      const { title, body } = msgs[Math.floor(Math.random() * msgs.length)];

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: soundValue,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerTime,
        },
      });
    }
  }
};
