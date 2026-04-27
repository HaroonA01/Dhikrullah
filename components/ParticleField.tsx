import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  minOpacity: number;
  maxOpacity: number;
}

function ParticleDot({ particle, color }: { particle: Particle; color: string }) {
  const opacity = useSharedValue(particle.minOpacity);

  useEffect(() => {
    opacity.value = withDelay(
      particle.delay,
      withRepeat(
        withSequence(
          withTiming(particle.maxOpacity, { duration: 2000 + particle.delay % 1000 }),
          withTiming(particle.minOpacity, { duration: 2000 + (particle.delay * 1.3) % 1000 }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        animStyle,
        {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
        },
      ]}
    />
  );
}

interface Props {
  count?: number;
}

export function ParticleField({ count = 25 }: Props) {
  const { palette } = useTheme();
  const particles = useMemo<Particle[]>(() => {
    const list: Particle[] = [];
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return Math.abs(seed) / 0xffffffff;
    };
    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        x: rand() * 100,
        y: rand() * 100,
        size: 1 + rand() * 2.5,
        delay: rand() * 2000,
        minOpacity: 0.1 + rand() * 0.2,
        maxOpacity: 0.4 + rand() * 0.35,
      });
    }
    return list;
  }, [count]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => (
        <ParticleDot key={p.id} particle={p} color={palette.accent} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
  },
});
