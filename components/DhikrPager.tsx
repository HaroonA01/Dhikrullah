import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Dhikr } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { usePrefs } from '@/context/PrefsContext';
import { ARABIC_FONTS, ENGLISH_FONTS, ARABIC_SIZE, TRANSLIT_SIZE, TRANSLATION_SIZE } from '@/lib/fonts';
import { PageDots } from './PageDots';

export function DhikrPager({ dhikr }: { dhikr: Dhikr }) {
  const { palette } = useTheme();
  const { arabicFont, englishFont, textSize } = usePrefs();
  const [page, setPage] = useState(0);

  const arabicFF = ARABIC_FONTS.find(f => f.id === arabicFont)?.fontFamily ?? undefined;
  const englishFF = ENGLISH_FONTS.find(f => f.id === englishFont)?.fontFamily ?? undefined;

  return (
    <View style={styles.wrap}>
      <PagerView
        key={dhikr.id}
        style={styles.pager}
        initialPage={0}
        onPageSelected={e => setPage(e.nativeEvent.position)}
      >
        <View key="ar" style={styles.page}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <Text style={[styles.arabic, { color: palette.textDark, fontSize: ARABIC_SIZE[textSize], lineHeight: ARABIC_SIZE[textSize] * 1.6, fontFamily: arabicFF }]}>
              {dhikr.arabic}
            </Text>
          </ScrollView>
        </View>
        <View key="tr" style={styles.page}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <Text style={[styles.translit, { color: palette.textDark, fontSize: TRANSLIT_SIZE[textSize], fontFamily: englishFF }]}>
              {dhikr.transliteration}
            </Text>
          </ScrollView>
        </View>
        <View key="en" style={styles.page}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <Text style={[styles.translation, { color: palette.textDark, fontSize: TRANSLATION_SIZE[textSize], lineHeight: TRANSLATION_SIZE[textSize] * 1.5, fontFamily: englishFF }]}>
              {dhikr.translation}
            </Text>
          </ScrollView>
        </View>
      </PagerView>
      <PageDots count={3} active={page} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', flex: 1 },
  pager: { flex: 1 },
  page: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  arabic: { textAlign: 'center' },
  translit: { fontStyle: 'italic', fontWeight: '400', textAlign: 'center' },
  translation: { fontWeight: '400', textAlign: 'center' },
});
