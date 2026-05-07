import { Alert, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';
import { useTutorial, TUTORIAL_STEPS } from '@/context/TutorialContext';
import { Spotlight } from './Spotlight';
import { GestureHint } from './GestureHint';
import { CaptionCard } from './CaptionCard';

export function TutorialOverlay() {
  const { palette } = useTheme();
  const { active, current, index, total, rect, next, stop } = useTutorial();

  if (!active || !current) return null;

  const onSkip = () => {
    Alert.alert(
      'Skip tutorial?',
      'You can replay it from Settings → Help.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => stop(true) },
      ],
    );
  };

  const isLast = index >= TUTORIAL_STEPS.length - 1;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={26}
        tint={palette.scheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      {rect ? <Spotlight rect={rect} /> : (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.fullDim]} />
      )}
      {rect && current.hint ? <GestureHint kind={current.hint} rect={rect} /> : null}
      <CaptionCard
        title={current.title}
        body={current.body}
        index={index}
        total={total}
        isLast={isLast}
        rect={rect}
        onNext={next}
        onSkip={onSkip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullDim: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});
