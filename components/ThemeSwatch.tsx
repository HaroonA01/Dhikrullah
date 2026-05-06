import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';
import type { Theme, SpecialTheme } from '@/constants/themes';
import { useTheme } from '@/context/ThemeContext';

function heartPath(s: number): string {
  const p = (f: number) => f * s;
  return (
    `M ${p(0.50)} ${p(0.88)} ` +
    `C ${p(0.50)} ${p(0.88)} ${p(0.06)} ${p(0.56)} ${p(0.06)} ${p(0.36)} ` +
    `C ${p(0.06)} ${p(0.14)} ${p(0.22)} ${p(0.10)} ${p(0.35)} ${p(0.10)} ` +
    `C ${p(0.42)} ${p(0.10)} ${p(0.48)} ${p(0.15)} ${p(0.50)} ${p(0.22)} ` +
    `C ${p(0.52)} ${p(0.15)} ${p(0.58)} ${p(0.10)} ${p(0.65)} ${p(0.10)} ` +
    `C ${p(0.78)} ${p(0.10)} ${p(0.94)} ${p(0.14)} ${p(0.94)} ${p(0.36)} ` +
    `C ${p(0.94)} ${p(0.56)} ${p(0.50)} ${p(0.88)} ${p(0.50)} ${p(0.88)} Z`
  );
}

const GOLD = '#D4AF37';

type NormalProps = {
  kind?: 'normal';
  theme: Theme;
  selected: boolean;
  onPress: () => void;
  onLongPress?: never;
  delayLongPress?: never;
  size?: number;
};

type SpecialProps = {
  kind: 'special';
  theme: SpecialTheme;
  selected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
  size?: number;
};

type Props = NormalProps | SpecialProps;

export function ThemeSwatch(props: Props) {
  const { selected, onPress, size = 56 } = props;
  const { palette } = useTheme();
  const r = size / 2;

  if (props.kind === 'special') {
    const { theme, onLongPress, delayLongPress } = props;
    const ringWidth = selected ? 2.5 : 1.5;
    const innerR = r - ringWidth;
    const id = theme.id;

    // ── Heart icon (Fifty Six) ───────────────────────────────────────────────
    if (theme.swatchIcon === 'heart-split' && theme.lightPalette) {
      const lp = theme.lightPalette;
      const hp = heartPath(size);
      const outerClip = `hs-outer-${id}`;
      const bgGrad    = `hs-bg-${id}`;
      return (
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={delayLongPress}
          style={({ pressed }) => [styles.wrap, { width: size + 8, height: size + 8 }, pressed && styles.pressed]}
          hitSlop={6}
        >
          <Svg width={size} height={size}>
            <Defs>
              <ClipPath id={outerClip}><Circle cx={r} cy={r} r={innerR} /></ClipPath>
              <LinearGradient id={bgGrad} x1={0} y1={0} x2={0} y2={size} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={lp.gradientColors[0]} stopOpacity={1} />
                <Stop offset="1" stopColor={lp.gradientColors[lp.gradientColors.length - 1]} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <G clipPath={`url(#${outerClip})`}>
              <Rect x={0} y={0} width={size} height={size} fill={`url(#${bgGrad})`} />
              <Path d={hp} fill={lp.accent} />
            </G>
            <Circle cx={r} cy={r} r={r - ringWidth / 2} fill="none" stroke={GOLD} strokeWidth={ringWidth} />
          </Svg>
        </Pressable>
      );
    }

    // ── Infinity icon (Always & Forever) ─────────────────────────────────────
    if (theme.swatchIcon === 'infinity') {
      const clipId = `inf-clip-${id}`;
      const gradId = `inf-grad-${id}`;
      const colors = theme.palette.gradientColors;
      return (
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          delayLongPress={delayLongPress}
          style={({ pressed }) => [styles.wrap, { width: size + 8, height: size + 8 }, pressed && styles.pressed]}
          hitSlop={6}
        >
          <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
              <Defs>
                <ClipPath id={clipId}><Circle cx={r} cy={r} r={innerR} /></ClipPath>
                <LinearGradient id={gradId} x1={0} y1={0} x2={0} y2={size} gradientUnits="userSpaceOnUse">
                  <Stop offset="0" stopColor={colors[0]} stopOpacity={1} />
                  <Stop offset="0.5" stopColor={colors[Math.floor(colors.length / 2)]} stopOpacity={1} />
                  <Stop offset="1" stopColor={colors[colors.length - 1]} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <G clipPath={`url(#${clipId})`}>
                <Rect x={0} y={0} width={size} height={size} fill={`url(#${gradId})`} />
              </G>
              <Circle cx={r} cy={r} r={r - ringWidth / 2} fill="none" stroke={GOLD} strokeWidth={ringWidth} />
            </Svg>
            <Text style={[styles.infinityLabel, { fontSize: size * 0.42, color: GOLD, top: size * 0.25 }]}>
              ∞
            </Text>
          </View>
        </Pressable>
      );
    }

    // ── Default gradient circle ───────────────────────────────────────────────
    const clipId = `special-clip-${id}`;
    const gradId = `special-grad-${id}`;
    const colors = theme.palette.gradientColors;
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={delayLongPress}
        style={({ pressed }) => [
          styles.wrap,
          { width: size + 8, height: size + 8 },
          pressed && styles.pressed,
        ]}
        hitSlop={6}
      >
        <Svg width={size} height={size}>
          <Defs>
            <ClipPath id={clipId}>
              <Circle cx={r} cy={r} r={innerR} />
            </ClipPath>
            <LinearGradient id={gradId} x1={0} y1={0} x2={0} y2={size} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={colors[0]} stopOpacity={1} />
              <Stop offset="0.5" stopColor={colors[Math.floor(colors.length / 2)]} stopOpacity={1} />
              <Stop offset="1" stopColor={colors[colors.length - 1]} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <G clipPath={`url(#${clipId})`}>
            <Rect x={0} y={0} width={size} height={size} fill={`url(#${gradId})`} />
          </G>
          <Circle cx={r} cy={r} r={r - ringWidth / 2} fill="none" stroke={GOLD} strokeWidth={ringWidth} />
        </Svg>
      </Pressable>
    );
  }

  // normal theme
  const theme = props.theme;
  const ringWidth = selected ? 2.5 : 1;
  const ringColor = selected ? palette.accent : palette.glassBorder;
  const innerR = r - ringWidth;
  const clipId = `swatch-clip-${theme.id}`;
  const lightSheenId = `swatch-sheen-light-${theme.id}`;
  const darkSheenId = `swatch-sheen-dark-${theme.id}`;
  const lightTri = `0,0 ${size},0 ${size},${size}`;
  const darkTri = `0,0 0,${size} ${size},${size}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        { width: size + 8, height: size + 8 },
        pressed && styles.pressed,
      ]}
      hitSlop={6}
    >
      <Svg width={size} height={size}>
        <Defs>
          <ClipPath id={clipId}>
            <Circle cx={r} cy={r} r={innerR} />
          </ClipPath>
          <LinearGradient
            id={lightSheenId}
            x1={0}
            y1={0}
            x2={0}
            y2={size}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.22} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.05} />
          </LinearGradient>
          <LinearGradient
            id={darkSheenId}
            x1={0}
            y1={0}
            x2={0}
            y2={size}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.12} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.18} />
          </LinearGradient>
        </Defs>
        <G clipPath={`url(#${clipId})`}>
          <Polygon points={lightTri} fill={theme.light.accent} />
          <Polygon points={lightTri} fill={`url(#${lightSheenId})`} />
          <Polygon points={darkTri} fill={theme.dark.accent} />
          <Polygon points={darkTri} fill={`url(#${darkSheenId})`} />
        </G>
        <Circle
          cx={r}
          cy={r}
          r={r - ringWidth / 2}
          fill="none"
          stroke={ringColor}
          strokeWidth={ringWidth}
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  infinityLabel: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontWeight: '300',
    opacity: 0.92,
  },
});
