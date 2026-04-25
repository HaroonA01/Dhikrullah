import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { GlassCard } from '@/components/GlassCard';
import { ACCENT, TEXT_DARK, TEXT_DIM, TEXT_MID } from '@/constants/theme';

interface Props {
  Icon: LucideIcon;
  label: string;
  value: string;
  valueSuffix?: string;
  caption?: string;
}

export function StatTile({ Icon, label, value, valueSuffix, caption }: Props) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.iconRow}>
        <Icon size={20} color={ACCENT} strokeWidth={1.5} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
        {valueSuffix ? <Text style={styles.valueSuffix}>{valueSuffix}</Text> : null}
      </Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
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
    color: TEXT_MID,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },
  valueSuffix: {
    color: ACCENT,
  },
  caption: {
    fontSize: 10,
    color: TEXT_DIM,
    marginTop: 6,
    lineHeight: 13,
  },
});
