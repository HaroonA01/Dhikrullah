import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Item {
  label: string;
  route: '/(tabs)' | '/(tabs)/stats' | '/(tabs)/share' | '/(tabs)/settings';
  replace?: boolean;
}

const ITEMS: Item[] = [
  { label: 'Home', route: '/(tabs)', replace: true },
  { label: 'Stats', route: '/(tabs)/stats' },
  { label: 'Share', route: '/(tabs)/share' },
  { label: 'Settings', route: '/(tabs)/settings' },
];

export function BottomNavBar() {
  const insets = useSafeAreaInsets();

  const go = (item: Item) => {
    if (item.replace) router.replace(item.route);
    else router.push(item.route);
  };

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + 8 }]}>
      {ITEMS.map(item => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          onPress={() => go(item)}
        >
          <Text style={styles.label}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  pressed: { opacity: 0.5 },
  label: { fontSize: 13, color: '#9AA5B4' },
});
