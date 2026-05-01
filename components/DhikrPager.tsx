import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Dhikr } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { PageDots } from './PageDots';

export function DhikrPager({ dhikr }: { dhikr: Dhikr }) {
  const { palette } = useTheme();
  const [page, setPage] = useState(0);

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
            <Text style={[styles.arabic, { color: palette.textDark }]}>
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
            <Text style={[styles.translit, { color: palette.textMid }]}>
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
            <Text style={[styles.translation, { color: palette.textMid }]}>
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
  arabic: { fontSize: 30, textAlign: 'center', lineHeight: 48 },
  translit: { fontSize: 18, fontStyle: 'italic', textAlign: 'center' },
  translation: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
});
