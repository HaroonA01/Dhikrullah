import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  visible: boolean;
  onAllow: () => void;
  onSkip: () => void;
}

export function LocationPrompt({ visible, onAllow, onSkip }: Props) {
  const { palette } = useTheme();
  const cardBg = palette.scheme === 'dark' ? palette.bgMid : '#FFFFFF';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: palette.glassBorder },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: palette.accentLight }]}>
            <MapPin size={28} color={palette.accent} strokeWidth={2} />
          </View>
          <Text style={[styles.title, { color: palette.textDark }]}>
            Enable prayer times
          </Text>
          <Text style={[styles.body, { color: palette.textMid }]}>
            Dhikrullah uses your location to calculate accurate prayer times. Your
            location stays on your device.
          </Text>

          <Pressable
            onPress={onAllow}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: palette.accent },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryText}>Allow location</Text>
          </Pressable>

          <Pressable
            onPress={onSkip}
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Text style={[styles.secondaryText, { color: palette.textMid }]}>
              Not now
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 8,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
