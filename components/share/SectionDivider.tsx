import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  variant?: 'full' | 'ornament';
  marginVertical?: number;
}

export function SectionDivider({ variant = 'full', marginVertical = 12 }: Props) {
  const { palette } = useTheme();

  return (
    <View style={[styles.row, { marginVertical }]}>
      {variant === 'full' && (
        <View style={[styles.line, { backgroundColor: palette.glassBorder }]} />
      )}
      <View style={styles.ornamentWrap}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Path
            d="M7 1 L13 7 L7 13 L1 7 Z"
            fill={palette.accent}
            opacity={0.85}
          />
          <Path
            d="M7 4 L10 7 L7 10 L4 7 Z"
            fill={palette.bgMid}
          />
        </Svg>
      </View>
      {variant === 'full' && (
        <View style={[styles.line, { backgroundColor: palette.glassBorder }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    opacity: 0.7,
  },
  ornamentWrap: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
