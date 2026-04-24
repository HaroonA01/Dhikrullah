import { useCallback } from 'react';
import { CategoryId, CounterState } from '@/types';
import { useCounterContext } from '@/context/CounterContext';

interface UseCounterResult {
  hydrated: boolean;
  state: CounterState;
  incrementCurrent: () => void;
  nextDhikr: () => void;
  resetAll: () => void;
}

export function useCounter(categoryId: CategoryId): UseCounterResult {
  const ctx = useCounterContext();
  const state = ctx.states[categoryId];

  const incrementCurrent = useCallback(() => ctx.incrementCurrent(categoryId), [ctx, categoryId]);
  const nextDhikr = useCallback(() => ctx.nextDhikr(categoryId), [ctx, categoryId]);
  const resetAll = useCallback(() => ctx.resetAll(categoryId), [ctx, categoryId]);

  return { hydrated: ctx.hydrated, state, incrementCurrent, nextDhikr, resetAll };
}
