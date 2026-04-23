import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Vibration,
} from 'react-native';

const DHIKR_LIST = [
  { arabic: 'سُبْحَانَ اللّهِ', transliteration: 'Subhanallah', translation: 'Glory be to Allah', target: 33 },
  { arabic: 'اَلْحَمْدُ لِلّهِ', transliteration: 'Alhamdulillah', translation: 'All praise is due to Allah', target: 33 },
  { arabic: 'اَللّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', target: 34 },
  { arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ', transliteration: 'La ilaha illallah', translation: 'There is no god but Allah', target: 100 },
];

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [count, setCount] = useState(0);

  const dhikr = DHIKR_LIST[selectedIndex];
  const progress = Math.min(count / dhikr.target, 1);
  const completed = count >= dhikr.target;

  function handleTap() {
    Vibration.vibrate(30);
    setCount((c) => c + 1);
  }

  function handleReset() {
    setCount(0);
  }

  function selectDhikr(index) {
    setSelectedIndex(index);
    setCount(0);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Dhikrullah</Text>
        <Text style={styles.subtitle}>Daily Dhikr Companion</Text>
      </View>

      <View style={styles.selector}>
        {DHIKR_LIST.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.tab, i === selectedIndex && styles.tabActive]}
            onPress={() => selectDhikr(i)}
          >
            <Text style={[styles.tabText, i === selectedIndex && styles.tabTextActive]}>
              {d.transliteration.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dhikrCard}>
        <Text style={styles.arabic}>{dhikr.arabic}</Text>
        <Text style={styles.transliteration}>{dhikr.transliteration}</Text>
        <Text style={styles.translation}>{dhikr.translation}</Text>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {count} / {dhikr.target}
        </Text>
      </View>

      {completed && (
        <Text style={styles.completedBadge}>✓ Target reached!</Text>
      )}

      <TouchableOpacity
        style={[styles.counterButton, completed && styles.counterButtonDone]}
        onPress={handleTap}
        activeOpacity={0.7}
      >
        <Text style={styles.counterCount}>{count}</Text>
        <Text style={styles.counterHint}>Tap to count</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const GREEN = '#2E7D32';
const GOLD = '#C9A84C';
const BG = '#1A1A2E';
const CARD = '#16213E';
const SURFACE = '#0F3460';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
  },
  header: {
    marginTop: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 4,
  },
  selector: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: GOLD,
  },
  tabText: {
    color: '#ccc',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  dhikrCard: {
    marginTop: 24,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    borderWidth: 1,
    borderColor: GOLD + '44',
  },
  arabic: {
    fontSize: 32,
    color: GOLD,
    textAlign: 'center',
    lineHeight: 50,
  },
  transliteration: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
    fontStyle: 'italic',
  },
  translation: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 4,
    textAlign: 'center',
  },
  progressRow: {
    marginTop: 20,
    width: '85%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: SURFACE,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GREEN,
    borderRadius: 3,
  },
  progressLabel: {
    color: '#aaa',
    fontSize: 12,
    minWidth: 50,
    textAlign: 'right',
  },
  completedBadge: {
    marginTop: 8,
    color: GREEN,
    fontSize: 13,
    fontWeight: '600',
  },
  counterButton: {
    marginTop: 32,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: GOLD,
  },
  counterButtonDone: {
    borderColor: GREEN,
  },
  counterCount: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
  },
  counterHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  resetButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 10,
    backgroundColor: SURFACE,
    borderRadius: 20,
  },
  resetText: {
    color: '#aaa',
    fontSize: 14,
  },
});
