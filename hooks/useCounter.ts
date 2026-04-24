import { useCallback } from 'react';
import { CategoryId, CounterState } from '@/types';
import { useCounterContext } from '@/context/CounterContext';

interface UseCounterResult {
  hydrated: boolean;
  state: CounterState;
  confettiTick: number;
  incrementCurrent: () => void;
  decrementCurrent: () => void;
  nextDhikr: () => void;
  prevDhikr: () => void;
  resetAll: () => void;
}

const EMPTY_STATE: CounterState = { currentDhikrIndex: 0, counts: {} };

export function useCounter(categoryId: CategoryId): UseCounterResult {
  const ctx = useCounterContext();
  const state = ctx.states[categoryId] ?? EMPTY_STATE;
  const confettiTick = ctx.confettiTicks[categoryId] ?? 0;

  const incrementCurrent = useCallback(() => ctx.incrementCurrent(categoryId), [ctx, categoryId]);
  const decrementCurrent = useCallback(() => ctx.decrementCurrent(categoryId), [ctx, categoryId]);
  const nextDhikr = useCallback(() => ctx.nextDhikr(categoryId), [ctx, categoryId]);
  const prevDhikr = useCallback(() => ctx.prevDhikr(categoryId), [ctx, categoryId]);
  const resetAll = useCallback(() => ctx.resetAll(categoryId), [ctx, categoryId]);

  return {
    hydrated: ctx.hydrated,
    state,
    confettiTick,
    incrementCurrent,
    decrementCurrent,
    nextDhikr,
    prevDhikr,
    resetAll,
  };
}
