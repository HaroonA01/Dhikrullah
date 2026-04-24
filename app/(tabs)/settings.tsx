import { StyleSheet, Text, View } from 'react-native';
import { GradientBackground } from '@/components/GradientBackground';
import { TEXT_MID } from '@/constants/theme';

export default function Screen() {
  return (
    <View style={styles.wrap}>
      <GradientBackground />
      <Text style={styles.text}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: TEXT_MID },
});
