import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import type { Rect } from '@/context/TutorialContext';

interface Props {
  title: string;
  body: string;
  index: number;
  total: number;
  isLast: boolean;
  rect: Rect | null;
  onNext: () => void;
  onSkip: () => void;
}

const { height: SCREEN_H } = Dimensions.get('window');

export function CaptionCard({ title, body, index, total, isLast, rect, onNext, onSkip }: Props) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  const cardBg = palette.scheme === 'dark' ? palette.bgMid : '#FFFFFF';
  const screenH = SCREEN_H;

  // Place card opposite the spotlight; centered if no rect.
  let anchor: 'top' | 'bottom' | 'centre' = 'bottom';
  if (!rect) anchor = 'centre';
  else if (rect.y + rect.height / 2 < screenH / 2) anchor = 'bottom';
  else anchor = 'top';

  const positionStyle =
    anchor === 'top'
      ? { top: insets.top + 24, left: 24, right: 24 }
      : anchor === 'bottom'
        ? { bottom: insets.bottom + 28, left: 24, right: 24 }
        : { top: screenH / 2 - 110, left: 24, right: 24 };

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(160)}
      style={[
        styles.card,
        positionStyle,
        { backgroundColor: cardBg, borderColor: palette.glassBorder, shadowColor: palette.accent },
      ]}
    >
      <Text style={[styles.title, { color: palette.textDark }]}>{title}</Text>
      <Text style={[styles.body, { color: palette.textMid }]}>{body}</Text>
      <View style={styles.row}>
        <Pressable onPress={onSkip} hitSlop={10} style={({ pressed }) => [styles.skip, pressed && styles.pressed]}>
          <Text style={[styles.skipText, { color: palette.textDim }]}>Skip</Text>
        </Pressable>
        <Text style={[styles.counter, { color: palette.textDim }]}>
          {index + 1} / {total}
        </Text>
        <Pressable
          onPress={onNext}
          style={({ pressed }) => [
            styles.next,
            { backgroundColor: palette.accent },
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.nextText}>{isLast ? 'Done' : 'Next'}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skip: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginLeft: -4,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  counter: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  next: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pressed: {
    opacity: 0.7,
  },
});
