import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { PrefsProvider } from '@/context/PrefsContext';
import { DatabaseProvider } from '@/db/DatabaseProvider';
import { CounterProvider } from '@/context/CounterContext';
import { FavouritesProvider } from '@/context/FavouritesContext';

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
