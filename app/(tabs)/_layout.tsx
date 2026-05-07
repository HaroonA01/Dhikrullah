import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, BarChart2, Share2, Settings, Heart } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { homeEvents } from '@/lib/homeEvents';
import { getMeta, setMeta } from '@/db/queries';
import { FridayShareModal } from '@/components/FridayShareModal';

// ─── Friday Share Prompt ───────────────────────────────────────────────────
//
// TEST MODE: when true, modal shows on every tabs mount / foreground for
// visual iteration. Flip to false to enable production behaviour: only show
// once per Friday at or after 12:00 local time.
const FRIDAY_SHARE_TEST_MODE = false;

const FRIDAY = 5;
const NOON_HOUR = 12;
const META_KEY_LAST_FRIDAY_SHARE = 'last_friday_share_date';

function localDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shouldShowFridayShare(now: Date, lastShownISO: string | null): boolean {
  if (FRIDAY_SHARE_TEST_MODE) return true;
  if (now.getDay() !== FRIDAY) return false;
  if (now.getHours() < NOON_HOUR) return false;
  return lastShownISO !== localDateISO(now);
}

function FridayShareScheduler() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const last = await getMeta(META_KEY_LAST_FRIDAY_SHARE);
        if (cancelled) return;
        const now = new Date();
        if (shouldShowFridayShare(now, last)) {
          setOpen(true);
          if (!FRIDAY_SHARE_TEST_MODE) {
            await setMeta(META_KEY_LAST_FRIDAY_SHARE, localDateISO(now));
          }
        }
      } catch {
        // db not ready — silently skip this tick
      }
    };

    check();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') check();
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  return <FridayShareModal visible={open} onClose={() => setOpen(false)} />;
}

export default function TabsLayout() {
  const { palette } = useTheme();
  const isDark = palette.scheme === 'dark';
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: palette.bgMid,
            borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            borderTopWidth: 1,
            position: 'absolute',
          },
          tabBarActiveTintColor: palette.accent,
          tabBarInactiveTintColor: palette.textDim,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={1.5} />,
          }}
          listeners={({ navigation }) => ({
            tabPress: () => {
              if (navigation.isFocused()) homeEvents.collapse();
            },
          })}
        />
        <Tabs.Screen
          name="favourites"
          options={{
            title: 'Favourites',
            tabBarIcon: ({ color, size }) => <Heart size={size} color={color} strokeWidth={1.5} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} strokeWidth={1.5} />,
          }}
        />
        <Tabs.Screen
          name="share"
          options={{
            title: 'Share',
            tabBarIcon: ({ color, size }) => <Share2 size={size} color={color} strokeWidth={1.5} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} strokeWidth={1.5} />,
          }}
        />
      </Tabs>
      <FridayShareScheduler />
    </>
  );
}
