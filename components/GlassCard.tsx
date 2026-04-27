import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function GlassCard({ children, style }: Props) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.glassBg,
          borderColor: palette.glassBorder,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
