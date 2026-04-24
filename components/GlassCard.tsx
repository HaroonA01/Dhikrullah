import { StyleSheet, View, ViewStyle } from 'react-native';
import { glassCard } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function GlassCard({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    ...glassCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
