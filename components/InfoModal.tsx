import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  visible: boolean;
  description?: string | null;
  reference?: string | null;
  grade?: string | null;
  onClose: () => void;
}

export function InfoModal({ visible, description, reference, grade, onClose }: Props) {
  const { palette } = useTheme();
  const hasDescription = !!description && description.trim().length > 0;
  const hasReference = !!reference && reference.trim().length > 0;
  const hasGrade = !!grade && grade.trim().length > 0;
  const hasAny = hasDescription || hasReference || hasGrade;

  const cardBg = palette.scheme === 'dark' ? palette.bgMid : '#FFFFFF';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: palette.glassBorder },
          ]}
          onPress={() => {}}
        >
          <Pressable style={styles.close} onPress={onClose} hitSlop={12}>
            <X size={18} color={palette.textMid} strokeWidth={2} />
          </Pressable>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {!hasAny && (
              <Text
                style={[
                  styles.empty,
                  { color: palette.textMid },
                ]}
              >
                No additional information yet.
              </Text>
            )}

            {hasDescription && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: palette.accent }]}>Description</Text>
                <Text style={[styles.value, { color: palette.textDark }]}>{description}</Text>
              </View>
            )}

            {hasReference && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: palette.accent }]}>Reference</Text>
                <Text style={[styles.value, { color: palette.textDark }]}>{reference}</Text>
              </View>
            )}

            {hasGrade && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: palette.accent }]}>Grade</Text>
                <Text style={[styles.value, { color: palette.textDark }]}>{grade}</Text>
              </View>
            )}
          </ScrollView>
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
    maxHeight: '70%',
    borderRadius: 18,
    borderWidth: 1,
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
    zIndex: 2,
  },
  body: {
    paddingTop: 8,
    gap: 16,
  },
  section: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 15,
    lineHeight: 22,
  },
  empty: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
