import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { ACCENT, GLASS_BORDER, TEXT_DARK, TEXT_MID } from '@/constants/theme';

interface Props {
  visible: boolean;
  reference: string;
  onClose: () => void;
}

export function InfoModal({ visible, reference, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Pressable style={styles.close} onPress={onClose} hitSlop={12}>
            <X size={18} color={TEXT_MID} strokeWidth={2} />
          </Pressable>
          <Text style={styles.title}>Reference</Text>
          <Text style={styles.body}>{reference}</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    color: TEXT_DARK,
    lineHeight: 22,
  },
});
