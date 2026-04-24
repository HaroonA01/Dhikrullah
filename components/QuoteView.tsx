import { StyleSheet, Text, View } from 'react-native';
import { Quote } from '@/types';

export function QuoteView({ quote }: { quote: Quote }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>&ldquo;{quote.text}&rdquo;</Text>
      {quote.source ? <Text style={styles.source}>— {quote.source}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 32, alignItems: 'center' },
  text: { fontSize: 16, textAlign: 'center', lineHeight: 24, color: '#333' },
  source: { fontSize: 13, marginTop: 12, color: '#666' },
});
