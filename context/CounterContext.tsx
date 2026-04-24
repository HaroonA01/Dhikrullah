import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CategoryId, CounterState } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { DHIKRS } from '@/data/dhikrs';
import { multiGetJSON, setJSON, storageKey } from '@/lib/storage';
import { hapticsLight, hapticsStrong } from '@/lib/haptics';

type AllState = Record<CategoryId, CounterState>;
type TickMap = Partial<Record<CategoryId, number>>;

interface ContextValue {
  hydrated: boolean;
  states: AllState;
  confettiTicks: TickMap;
  incrementCurrent: (id: CategoryId) => void;
  decrementCurrent: (id: CategoryId) => void;
  nextDhikr: (id: CategoryId) => void;
  prevDhikr: (id: CategoryId) => void;
  resetAll: (id: CategoryId) => void;
}

const keyFor = (id: CategoryId) => storageKey(`counter:${id}`);

const emptyState = (id: CategoryId): CounterState => {
  const counts: Record<string, number> = {};
  for (const d of DHIKRS[id]) counts[d.id] = 0;
  return { currentDhikrIndex: 0, counts };
};

const buildInitial = (): AllState => {
  const out = {} as AllState;
  for (const c of CATEGORIES) out[c.id] = emptyState(c.id);
  return out;
};

const CounterContext = createContext<ContextValue | null>(null);

const ADVANCE_DELAY_MS = 3000;

export const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [states, setStates] = useState<AllState>(buildInitial);
  const [confettiTicks, setConfettiTicks] = useState<TickMap>({});
  const [hydrated, setHydrated] = useState(false);
  const writeTimers = useRef<Partial<Record<CategoryId, ReturnType<typeof setTimeout>>>>({});
  const advanceTimers = useRef<Partial<Record<CategoryId, ReturnType<typeof setTimeout>>>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const keys = CATEGORIES.map(c => keyFor(c.id));
      const loaded = await multiGetJSON<CounterState>(keys);
      if (cancelled) return;
      setStates(prev => {
        const next = { ...prev };
        for (const c of CATEGORIES) {
          const stored = loaded[keyFor(c.id)];
          if (stored) {
            const counts = { ...prev[c.id].counts };
            for (const [dId, v] of Object.entries(stored.counts ?? {})) {
              if (dId in counts) counts[dId] = v;
            }
            const idx = Math.min(
              Math.max(stored.currentDhikrIndex ?? 0, 0),
              DHIKRS[c.id].length - 1,
            );
            next[c.id] = { currentDhikrIndex: idx, counts };
          }
        }
        return next;
      });
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timers = advanceTimers.current;
    return () => {
      for (const key of Object.keys(timers)) {
        const t = timers[key as CategoryId];
        if (t) clearTimeout(t);
      }
    };
  }, []);

  const scheduleWrite = useCallback((id: CategoryId, state: CounterState) => {
    const existing = writeTimers.current[id];
    if (existing) clearTimeout(existing);
    writeTimers.current[id] = setTimeout(() => {
      setJSON(keyFor(id), state);
    }, 150);
  }, []);

  const bumpConfetti = useCallback((id: CategoryId) => {
    setConfettiTicks(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);

  const scheduleAdvance = useCallback((id: CategoryId) => {
    const existing = advanceTimers.current[id];
    if (existing) clearTimeout(existing);
    advanceTimers.current[id] = setTimeout(() => {
      setStates(prev => {
        const list = DHIKRS[id];
        const cur = prev[id];
        const dhikr = list[cur.currentDhikrIndex];
        if (!dhikr) return prev;
        const curCount = cur.counts[dhikr.id] ?? 0;
        if (curCount < dhikr.target) return prev;
        if (cur.currentDhikrIndex + 1 >= list.length) return prev;
        const nextIdx = cur.currentDhikrIndex + 1;
        const nextD = list[nextIdx];
        const counts = { ...cur.counts, [nextD.id]: 0 };
        const nextState: CounterState = { currentDhikrIndex: nextIdx, counts };
        scheduleWrite(id, nextState);
        return { ...prev, [id]: nextState };
      });
    }, ADVANCE_DELAY_MS);
  }, [scheduleWrite]);

  const incrementCurrent = useCallback((id: CategoryId) => {
    setStates(prev => {
      const list = DHIKRS[id];
      const cur = prev[id];
      const dhikr = list[cur.currentDhikrIndex];
      if (!dhikr) return prev;
      const currentCount = cur.counts[dhikr.id] ?? 0;
      if (currentCount >= dhikr.target) return prev;
      const newCount = currentCount + 1;
      const counts = { ...cur.counts };

      if (newCount >= dhikr.target) {
        counts[dhikr.id] = dhikr.target;
        hapticsStrong();
        bumpConfetti(id);
        if (cur.currentDhikrIndex + 1 < list.length) {
          scheduleAdvance(id);
        }
      } else {
        counts[dhikr.id] = newCount;
        hapticsLight();
      }

      const nextState: CounterState = { currentDhikrIndex: cur.currentDhikrIndex, counts };
      scheduleWrite(id, nextState);
      return { ...prev, [id]: nextState };
    });
  }, [scheduleWrite, bumpConfetti, scheduleAdvance]);

  const decrementCurrent = useCallback((id: CategoryId) => {
    setStates(prev => {
      const list = DHIKRS[id];
      const cur = prev[id];
      const dhikr = list[cur.currentDhikrIndex];
      if (!dhikr) return prev;
      const currentCount = cur.counts[dhikr.id] ?? 0;
      if (currentCount <= 0) return prev;
      const counts = { ...cur.counts, [dhikr.id]: currentCount - 1 };
      hapticsLight();
      const nextState: CounterState = { ...cur, counts };
      scheduleWrite(id, nextState);
      return { ...prev, [id]: nextState };
    });
  }, [scheduleWrite]);

  const clearAdvance = useCallback((id: CategoryId) => {
    const t = advanceTimers.current[id];
    if (t) {
      clearTimeout(t);
      advanceTimers.current[id] = undefined;
    }
  }, []);

  const nextDhikr = useCallback((id: CategoryId) => {
    clearAdvance(id);
    setStates(prev => {
      const list = DHIKRS[id];
      const cur = prev[id];
      if (cur.currentDhikrIndex + 1 >= list.length) return prev;
      const nextState: CounterState = {
        ...cur,
        currentDhikrIndex: cur.currentDhikrIndex + 1,
      };
      scheduleWrite(id, nextState);
      return { ...prev, [id]: nextState };
    });
  }, [scheduleWrite, clearAdvance]);

  const prevDhikr = useCallback((id: CategoryId) => {
    clearAdvance(id);
    setStates(prev => {
      const cur = prev[id];
      if (cur.currentDhikrIndex <= 0) return prev;
      const nextState: CounterState = {
        ...cur,
        currentDhikrIndex: cur.currentDhikrIndex - 1,
      };
      scheduleWrite(id, nextState);
      return { ...prev, [id]: nextState };
    });
  }, [scheduleWrite, clearAdvance]);

  const resetAll = useCallback((id: CategoryId) => {
    clearAdvance(id);
    setStates(prev => {
      const next = emptyState(id);
      scheduleWrite(id, next);
      return { ...prev, [id]: next };
    });
  }, [scheduleWrite, clearAdvance]);

  return (
    <CounterContext.Provider
      value={{
        hydrated,
        states,
        confettiTicks,
        incrementCurrent,
        decrementCurrent,
        nextDhikr,
        prevDhikr,
        resetAll,
      }}
    >
      {children}
    </CounterContext.Provider>
  );
};

export const useCounterContext = (): ContextValue => {
  const ctx = useContext(CounterContext);
  if (!ctx) throw new Error('useCounterContext must be used inside CounterProvider');
  return ctx;
};
