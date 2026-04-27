import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function PageDots({ count, active }: { count: number; active: number }) {
  const { palette } = useTheme();
  const inactiveColor =
    palette.scheme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)';
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i === active ? palette.accent : inactiveColor },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
