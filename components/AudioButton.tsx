import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Audio, AVPlaybackSource } from 'expo-av';
import { Pause, Volume2, VolumeX } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  source?: AVPlaybackSource;
  dhikrId: string;
}

export function AudioButton({ source, dhikrId }: Props) {
  const { palette } = useTheme();
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      const s = soundRef.current;
      soundRef.current = null;
      if (s) s.unloadAsync().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const s = soundRef.current;
    soundRef.current = null;
    setPlaying(false);
    if (s) s.unloadAsync().catch(() => {});
  }, [dhikrId]);

  const toggle = async () => {
    if (!source) return;
    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate(status => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setPlaying(false);
            sound.setPositionAsync(0).catch(() => {});
          } else {
            setPlaying(status.isPlaying);
          }
        });
        setPlaying(true);
        return;
      }
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setPlaying(false);
      } else {
        if ((status.positionMillis ?? 0) >= (status.durationMillis ?? 1)) {
          await soundRef.current.setPositionAsync(0);
        }
        await soundRef.current.playAsync();
        setPlaying(true);
      }
    } catch {
      // swallow: playback errors shouldn't crash UI
    }
  };

  const disabled = !source;
  const Icon = disabled ? VolumeX : playing ? Pause : Volume2;
  const color = disabled ? palette.textDim : palette.accent;

  return (
    <Pressable
      onPress={toggle}
      disabled={disabled}
      hitSlop={10}
      style={[
        styles.btn,
        { backgroundColor: palette.glassBg, borderColor: palette.glassBorder },
        disabled && styles.disabled,
      ]}
    >
      <Icon size={18} color={color} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
