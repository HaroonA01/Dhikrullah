import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CategoryId, CounterState } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { DHIKRS } from '@/data/dhikrs';
import { multiGetJSON, setJSON, storageKey } from '@/lib/storage';
import { hapticsLight, hapticsStrong } from '@/lib/haptics';

type AllState = Record<CategoryId, CounterState>;

interface ContextValue {
  hydrated: boolean;
  states: AllState;
  incrementCurrent: (id: CategoryId) => void;
  nextDhikr: (id: CategoryId) => void;
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

export const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [states, setStates] = useState<AllState>(buildInitial);
  const [hydrated, setHydrated] = useState(false);
  const writeTimers = useRef<Partial<Record<CategoryId, ReturnType<typeof setTimeout>>>>({});

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

  const scheduleWrite = useCallback((id: CategoryId, state: CounterState) => {
    const existing = writeTimers.current[id];
    if (existing) clearTimeout(existing);
    writeTimers.current[id] = setTimeout(() => {
      setJSON(keyFor(id), state);
    }, 150);
  }, []);

  const incrementCurrent = useCallback((id: CategoryId) => {
    setStates(prev => {
      const list = DHIKRS[id];
      const cur = prev[id];
      const dhikr = list[cur.currentDhikrIndex];
      if (!dhikr) return prev;
      const currentCount = cur.counts[dhikr.id] ?? 0;
      const newCount = currentCount + 1;
      const counts = { ...cur.counts };
      let nextIdx = cur.currentDhikrIndex;

      if (newCount >= dhikr.target) {
        counts[dhikr.id] = dhikr.target;
        hapticsStrong();
        if (cur.currentDhikrIndex + 1 < list.length) {
          nextIdx = cur.currentDhikrIndex + 1;
          const nextD = list[nextIdx];
          counts[nextD.id] = 0;
        }
      } else {
        counts[dhikr.id] = newCount;
        hapticsLight();
      }

      const nextState: CounterState = { currentDhikrIndex: nextIdx, counts };
      scheduleWrite(id, nextState);
      return { ...prev, [id]: nextState };
    });
  }, [scheduleWrite]);

  const nextDhikr = useCallback((id: CategoryId) => {
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
  }, [scheduleWrite]);

  const resetAll = useCallback((id: CategoryId) => {
    setStates(prev => {
      const next = emptyState(id);
      scheduleWrite(id, next);
      return { ...prev, [id]: next };
    });
  }, [scheduleWrite]);

  return (
    <CounterContext.Provider value={{ hydrated, states, incrementCurrent, nextDhikr, resetAll }}>
      {children}
    </CounterContext.Provider>
  );
};

export const useCounterContext = (): ContextValue => {
  const ctx = useContext(CounterContext);
  if (!ctx) throw new Error('useCounterContext must be used inside CounterProvider');
  return ctx;
};
