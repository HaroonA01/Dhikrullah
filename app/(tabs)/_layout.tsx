import { Tabs } from 'expo-router';
import { Home, BarChart2, Share2, Settings, Heart } from 'lucide-react-native';
import { ACCENT, TEXT_DIM } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.88)',
          borderTopColor: 'rgba(0,0,0,0.08)',
          borderTopWidth: 1,
          position: 'absolute',
        },
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: TEXT_DIM,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={1.5} />,
        }}
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
  );
}
