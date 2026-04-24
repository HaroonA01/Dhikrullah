import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DatabaseProvider } from '@/db/DatabaseProvider';
import { CounterProvider } from '@/context/CounterContext';
import { FavouritesProvider } from '@/context/FavouritesContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DatabaseProvider>
          <FavouritesProvider>
            <CounterProvider>
              <StatusBar style="dark" backgroundColor="transparent" translucent />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="counter/[category]" />
              </Stack>
            </CounterProvider>
          </FavouritesProvider>
        </DatabaseProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
