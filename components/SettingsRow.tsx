import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  label: string;
  detail?: string;
  Icon?: LucideIcon;
  trailing?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  isLast?: boolean;
}

export function SettingsRow({
  label,
  detail,
  Icon,
  trailing,
  onPress,
  showChevron,
  isLast,
}: Props) {
  const { palette } = useTheme();
  const content = (
    <View
      style={[
        styles.row,
        !isLast && {
          borderBottomColor: palette.glassBorder,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      {Icon ? (
        <View style={[styles.iconTile, { backgroundColor: palette.accentLight }]}>
          <Icon size={16} color={palette.accent} strokeWidth={2} />
        </View>
      ) : null}
      <View style={styles.left}>
        <Text style={[styles.label, { color: palette.textDark }]}>{label}</Text>
        {detail ? (
          <Text style={[styles.detail, { color: palette.textMid }]} numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {trailing}
        {showChevron ? (
          <ChevronRight size={18} color={palette.textDim} strokeWidth={2} />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    minHeight: 52,
    gap: 12,
  },
  iconTile: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  left: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  detail: {
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.6,
  },
});
