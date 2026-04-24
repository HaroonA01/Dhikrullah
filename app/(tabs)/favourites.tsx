import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';
import { useFavourites } from '@/context/FavouritesContext';
import { DHIKRS } from '@/data/dhikrs';
import { CATEGORIES } from '@/data/categories';
import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { ACCENT, TEXT_DARK, TEXT_MID, TEXT_DIM } from '@/constants/theme';
import { CategoryId } from '@/types';

interface FavItem {
  dhikrId: string;
  arabic: string;
  transliteration: string;
  categoryLabel: string;
}

function buildFavList(favouriteIds: Set<string>): FavItem[] {
  const items: FavItem[] = [];
  for (const cat of CATEGORIES) {
    const dhikrs = DHIKRS[cat.id as CategoryId] ?? [];
    for (const d of dhikrs) {
      if (favouriteIds.has(d.id)) {
        items.push({
          dhikrId: d.id,
          arabic: d.arabic,
          transliteration: d.transliteration,
          categoryLabel: cat.label,
        });
      }
    }
  }
  return items;
}

export default function FavouritesScreen() {
  const insets = useSafeAreaInsets();
  const { favouriteIds } = useFavourites();
  const items = buildFavList(favouriteIds);

  return (
    <View style={styles.root}>
      <GradientBackground />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.wordmark}>Dhikrullah</Text>
        <Text style={styles.title}>Favourites</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Heart size={40} color={ACCENT} strokeWidth={1.5} style={{ opacity: 0.4 }} />
          <Text style={styles.emptyTitle}>No favourites yet</Text>
          <Text style={styles.emptyHint}>
            Tap the heart icon on any dhikr to save it here
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {items.map(item => (
            <GlassCard key={item.dhikrId} style={styles.card}>
              <Text style={styles.categoryBadge}>{item.categoryLabel}</Text>
              <Text style={styles.arabic}>{item.arabic}</Text>
              <Text style={styles.transliteration}>{item.transliteration}</Text>
            </GlassCard>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  wordmark: {
    fontSize: 12,
    color: ACCENT,
    letterSpacing: 1.5,
    fontWeight: '600',
    opacity: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT_DARK,
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_DARK,
    opacity: 0.7,
  },
  emptyHint: {
    fontSize: 14,
    color: TEXT_MID,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: ACCENT,
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  arabic: {
    fontSize: 22,
    color: TEXT_DARK,
    textAlign: 'right',
    lineHeight: 36,
    marginBottom: 4,
  },
  transliteration: {
    fontSize: 13,
    color: TEXT_DIM,
    fontStyle: 'italic',
  },
});
