import { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { PrefsProvider, usePrefs } from '@/context/PrefsContext';
import { DatabaseProvider } from '@/db/DatabaseProvider';
import { CounterProvider } from '@/context/CounterContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { scheduleAllNotifications } from '@/lib/notifications';
import { GOOGLE_FONT_ASSETS } from '@/lib/fonts';

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
    notifSound,
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
        notifSound,
      ).catch(() => {});
    };

    schedule();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') schedule();
    });
    return () => sub.remove();
  }, [hydrated, location, prayerMethodId, madhab, wakingUpMinutes, beforeBedMinutes, notifEnabled, notifOffset, notifSound]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(GOOGLE_FONT_ASSETS);
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
