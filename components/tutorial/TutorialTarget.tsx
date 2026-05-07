import React, { useEffect, useRef } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTutorial } from '@/context/TutorialContext';

interface Props {
  id: string;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function TutorialTarget({ id, children, style }: Props) {
  const ref = useRef<View>(null);
  const { registerTarget, remeasure } = useTutorial();

  useEffect(() => {
    return registerTarget(id, ref);
  }, [id, registerTarget]);

  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={remeasure}
      style={style}
    >
      {children}
    </View>
  );
}
