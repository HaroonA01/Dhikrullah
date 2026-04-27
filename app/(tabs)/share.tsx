import { StyleSheet, Text, View } from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { useTheme } from '@/context/ThemeContext';

export default function Screen() {
  const { palette } = useTheme();
  return (
    <View style={styles.wrap}>
      <GradientBackground />
      <Text style={[styles.text, { color: palette.textMid }]}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18 },
});
