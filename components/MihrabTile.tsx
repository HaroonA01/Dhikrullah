import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, FeDropShadow, Filter, Path } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';
import {
  MIHRAB_ASPECT,
  MIHRAB_PATH_D,
  MIHRAB_VIEWBOX,
} from './mihrabPath';

interface Props {
  width: number;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function MihrabTile({ width, children, style }: Props) {
  const { palette } = useTheme();
  const height = width * MIHRAB_ASPECT;
  const fill =
    palette.scheme === 'dark'
      ? 'rgba(255,255,255,0.07)'
      : 'rgba(255,255,255,0.92)';

  return (
    <View style={[styles.wrap, { width, height }, style]}>
      <Svg
        width={width}
        height={height}
        viewBox={MIHRAB_VIEWBOX}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <Filter
            id="mihrabShadow"
            x="-20%"
            y="-10%"
            width="140%"
            height="125%"
          >
            <FeDropShadow
              dx="0"
              dy="2"
              stdDeviation="3"
              floodColor="#000"
              floodOpacity="0.12"
            />
          </Filter>
        </Defs>
        <Path
          d={MIHRAB_PATH_D}
          fill={fill}
          stroke={palette.glassBorder}
          strokeWidth={1}
          strokeLinejoin="round"
          filter="url(#mihrabShadow)"
        />
      </Svg>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  inner: {
    ...StyleSheet.absoluteFillObject,
  },
});
