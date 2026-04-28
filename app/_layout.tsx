import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { PrefsProvider, usePrefs } from '@/context/PrefsContext';
import { DatabaseProvider } from '@/db/DatabaseProvider';
import { CounterProvider } from '@/context/CounterContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { scheduleAllNotifications } from '@/lib/notifications';

function StatusBarReactive() {
  const { palette } = useTheme();
  return (
    <StatusBar
      style={palette.scheme === 'dark' ? 'light' : 'dark'}
      backgroundColor="transparent"
      translucent
    />
  );
}

function NotificationScheduler() {
  const {
    location,
    prayerMethodId,
    madhab,
    wakingUpMinutes,
    beforeBedMinutes,
    notifEnabled,
    notifOffset,
    hydrated,
  } = usePrefs();

  useEffect(() => {
    if (!hydrated) return;

    const schedule = () => {
      scheduleAllNotifications(
        notifEnabled,
        notifOffset,
        location,
        prayerMethodId,
        madhab,
        wakingUpMinutes,
        beforeBedMinutes,
      ).catch(() => {});
    };

    schedule();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') schedule();
    });
    return () => sub.remove();
  }, [hydrated, location, prayerMethodId, madhab, wakingUpMinutes, beforeBedMinutes, notifEnabled, notifOffset]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <DatabaseProvider>
            <PrefsProvider>
              <FavouritesProvider>
                <CounterProvider>
                  <StatusBarReactive />
                  <NotificationScheduler />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: 'transparent' },
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="counter/[category]" />
                  </Stack>
                </CounterProvider>
              </FavouritesProvider>
            </PrefsProvider>
          </DatabaseProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
