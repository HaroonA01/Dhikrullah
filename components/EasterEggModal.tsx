import { useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Sparkles, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PARAGRAPHS: string[] = [
  "Congratulations — you've found the secret hidden easter egg.",
  'I wanted to take a moment to thank everyone who helped make this app a reality. I am especially grateful to my mother and father, Azaan, Luqman, Zaibi, Mary, Sabia, Fatima, Tariq, Tamim, Nafiz, Vlad, Azim, Sahir, Shahir, and all of my family and friends for their support, encouragement, and motivation.',
  'A very special thank you to Shayma Bakali for generously sponsoring this project financially, and for providing the motivation and support that helped bring it to completion.',
  'A heartfelt thank you also goes to Brother Ahmed Tomal for inspiring the idea behind this app, and to Faisal Bhai for his constant help, sincere support, and genuine desire to bring everyone closer to the deen.',
  'Finally, my deepest gratitude goes to Imam Khidir, whose guidance and support were essential in bringing this app to life. Without his help, this project would not have been possible.',
  'We pray that Allah accepts this as sadaqah jariyah, places barakah in it, and makes it weigh heavily on all of our scales of good deeds.',
];

const TRACK_WIDTH = 4;
const MIN_THUMB_HEIGHT = 28;

export function EasterEggModal({ visible, onClose }: Props) {
  const { palette } = useTheme();
  const cardBg = palette.scheme === 'dark' ? palette.bgMid : '#FFFFFF';
  const windowH = Dimensions.get('window').height;
  const scrollMaxH = Math.max(180, Math.round(windowH * 0.82) - 200);

  const [scrollNeeded, setScrollNeeded] = useState(false);
  const [containerH, setContainerH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const scrollY = useSharedValue(0);
  const thumbOpacity = useSharedValue(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showThumb = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    thumbOpacity.value = withTiming(1, { duration: 120 });
    hideTimerRef.current = setTimeout(() => {
      thumbOpacity.value = withTiming(0.35, { duration: 600 });
    }, 900);
  };

  const onContentSizeChange = (_w: number, h: number) => {
    setContentH(h);
    const need = h > containerH + 1;
    setScrollNeeded(need);
    if (need) {
      thumbOpacity.value = withTiming(0.5, { duration: 250 });
    } else {
      thumbOpacity.value = 0;
    }
  };

  const onLayout = (e: { nativeEvent: { layout: { height: number } } }) => {
    const h = e.nativeEvent.layout.height;
    setContainerH(h);
    const need = contentH > h + 1;
    setScrollNeeded(need);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.value = e.nativeEvent.contentOffset.y;
    showThumb();
  };

  const trackHeight = containerH;
  const thumbHeight =
    contentH > 0 && containerH > 0
      ? Math.max(MIN_THUMB_HEIGHT, (containerH / contentH) * containerH)
      : 0;

  const thumbStyle = useAnimatedStyle(() => {
    const maxScroll = Math.max(1, contentH - containerH);
    const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
    const top = (scrollY.value / maxScroll) * maxThumbTop;
    return {
      opacity: thumbOpacity.value,
      transform: [{ translateY: top }],
    };
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: cardBg }]}
          onPress={() => {}}
        >
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.cardBorder,
              { borderColor: palette.glassBorder },
            ]}
          />

          <View style={styles.header}>
            <View
              style={[
                styles.iconTile,
                { backgroundColor: palette.accentLight },
              ]}
            >
              <Sparkles size={18} color={palette.accent} strokeWidth={2} />
            </View>
            <Text style={[styles.title, { color: palette.textDark }]}>
              A Secret Thank You
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [
                styles.closeBtn,
                pressed && { opacity: 0.6 },
              ]}
            >
              <X size={18} color={palette.textMid} strokeWidth={2} />
            </Pressable>
          </View>

          <View
            style={[styles.divider, { backgroundColor: palette.glassBorder }]}
          />

          <View
            style={[styles.scrollWrap, { maxHeight: scrollMaxH }]}
            onLayout={onLayout}
          >
            <ScrollView
              style={[styles.scroll, { maxHeight: scrollMaxH }]}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={onContentSizeChange}
              onScroll={onScroll}
              scrollEventThrottle={16}
              nestedScrollEnabled
            >
              {PARAGRAPHS.map((p, i) => (
                <Text
                  key={i}
                  style={[
                    styles.body,
                    { color: i === 0 ? palette.textDark : palette.textMid },
                    i === 0 && styles.bodyLead,
                  ]}
                >
                  {p}
                </Text>
              ))}
              <Text style={[styles.ameen, { color: palette.accent }]}>
                Ameen.
              </Text>
            </ScrollView>

            {scrollNeeded ? (
              <View
                pointerEvents="none"
                style={[
                  styles.scrollTrack,
                  {
                    height: trackHeight,
                    backgroundColor: palette.accentLight,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.scrollThumb,
                    {
                      height: thumbHeight,
                      backgroundColor: palette.accent,
                    },
                    thumbStyle,
                  ]}
                />
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.confirm,
              { backgroundColor: palette.accent },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Text style={styles.confirmText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '82%',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  cardBorder: {
    borderWidth: 1,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 6,
    opacity: 0.6,
  },
  scrollWrap: {
    marginTop: 6,
    position: 'relative',
  },
  scroll: {},
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 14,
    paddingRight: 14,
  },
  scrollTrack: {
    position: 'absolute',
    top: 8,
    right: 0,
    width: TRACK_WIDTH,
    borderRadius: TRACK_WIDTH / 2,
    overflow: 'hidden',
  },
  scrollThumb: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: TRACK_WIDTH,
    borderRadius: TRACK_WIDTH / 2,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  bodyLead: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  ameen: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  confirm: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
