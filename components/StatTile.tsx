import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GlassCard } from '@/components/GlassCard';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  Icon: LucideIcon;
  label: string;
  value: string;
  valueSuffix?: string;
  caption?: string;
  valueColor?: string;
}

export function StatTile({ Icon, label, value, valueSuffix, caption, valueColor }: Props) {
  const { palette } = useTheme();
  return (
    <GlassCard style={styles.card}>
      <View style={styles.iconRow}>
        <Icon size={20} color={palette.accent} strokeWidth={1.5} />
      </View>
      <Text style={[styles.label, { color: palette.textMid }]}>{label}</Text>
      <Text
        style={[styles.value, { color: valueColor ?? palette.textDark }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
        {valueSuffix ? (
          <Text style={{ color: palette.accent }}>{valueSuffix}</Text>
        ) : null}
      </Text>
      {caption ? (
        <Text style={[styles.caption, { color: palette.textDim }]}>{caption}</Text>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 120,
    justifyContent: 'flex-start',
  },
  iconRow: {
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  caption: {
    fontSize: 10,
    marginTop: 6,
    lineHeight: 13,
  },
});
