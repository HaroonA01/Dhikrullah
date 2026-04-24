import { Pressable, StyleSheet, Text } from 'react-native';

interface Props {
  count: number;
  target: number;
  onPress: () => void;
  disabled?: boolean;
}

export function CountButton({ count, target, onPress, disabled }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.target}>of {target}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  pressed: { backgroundColor: '#1b4332' },
  disabled: { opacity: 0.4 },
  count: { fontSize: 64, fontWeight: '700', color: '#FFFFFF' },
  target: { fontSize: 16, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
});
