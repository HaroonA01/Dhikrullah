import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Category, CategoryId, CounterState, Dhikr } from '@/types';
import { isKnownCategoryId } from '@/types';
import {
  getAllCategoryState,
  getAllCounters,
  getAllDhikrs,
  getCategories,
  resetCategoryCounts,
  setCategoryIndex,
  setCount,
} from '@/db/queries';
import { hapticsLight, hapticsStrong } from '@/lib/haptics';

type AllState = Record<string, CounterState>;
type TickMap = Record<string, number>;

interface ContextValue {
  hydrated: boolean;
  categories: Category[];
  dhikrsByCategory: Record<string, Dhikr[]>;
  states: AllState;
  confettiTicks: TickMap;
  incrementCurrent: (id: CategoryId) => void;
  decrementCurrent: (id: CategoryId) => void;
  nextDhikr: (id: CategoryId) => void;
  prevDhikr: (id: CategoryId) => void;
  resetAll: (id: CategoryId) => void;
}

const CounterContext = createContext<ContextValue | null>(null);

const ADVANCE_DELAY_MS = 3000;
const WRITE_DEBOUNCE_MS = 150;

function toCategory(row: { id: string; label: string; sortOrder: number }): Category {
  return {
    id: isKnownCategoryId(row.id) ? row.id : (row.id as CategoryId),
    label: row.label,
    sortOrder: row.sortOrder,
  };
}

function toDhikr(row: {
  id: string;
  categoryId: string;
  arabic: string;
  transliteration: string;
  translation: string;
  target: number;
  description: string | null;
  reference: string | null;
  grade: string | null;
  audioFilename: string | null;
  sortOrder: number;
}): Dhikr {
  return {
    id: row.id,
    categoryId: isKnownCategoryId(row.categoryId)
      ? row.categoryId
      : (row.categoryId as CategoryId),
    arabic: row.arabic,
    transliteration: row.transliteration,
    translation: row.translation,
    target: row.target,
    description: row.description,
    reference: row.reference,
    grade: row.grade,
    audioFilename: row.audioFilename,
    sortOrder: row.sortOrder,
  };
}

export const CounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dhikrsByCategory, setDhikrsByCategory] = useState<Record<string, Dhikr[]>>({});
  const [states, setStates] = useState<AllState>({});
  const [confettiTicks, setConfettiTicks] = useState<TickMap>({});
  const [hydrated, setHydrated] = useState(false);
  const countWriteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const indexWriteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const advanceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [catRows, dhikrRows, counterRows, stateRows] = await Promise.all([
        getCategories(),
        getAllDhikrs(),
        getAllCounters(),
        getAllCategoryState(),
      ]);
      if (cancelled) return;

      const cats = catRows.map(toCategory);
      const grouped: Record<string, Dhikr[]> = {};
      for (const r of dhikrRows) {
        const d = toDhikr(r);
        (grouped[d.categoryId] ??= []).push(d);
      }

      const countByDhikr = new Map(counterRows.map((c) => [c.dhikrId, c.count]));
      const idxByCategory = new Map(stateRows.map((s) => [s.categoryId, s.currentDhikrIndex]));

      const nextStates: AllState = {};
      for (const c of cats) {
        const list = grouped[c.id] ?? [];
        const counts: Record<string, number> = {};
        for (const d of list) {
          counts[d.id] = countByDhikr.get(d.id) ?? 0;
        }
        const rawIdx = idxByCategory.get(c.id) ?? 0;
        const maxIdx = Math.max(list.length - 1, 0);
        nextStates[c.id] = {
          currentDhikrIndex: Math.min(Math.max(rawIdx, 0), maxIdx),
          counts,
        };
      }

      setCategories(cats);
      setDhikrsByCategory(grouped);
      setStates(nextStates);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const aTimers = advanceTimers.current;
    const cTimers = countWriteTimers.current;
    const iTimers = indexWriteTimers.current;
    return () => {
      for (const k of Object.keys(aTimers)) clearTimeout(aTimers[k]);
      for (const k of Object.keys(cTimers)) clearTimeout(cTimers[k]);
      for (const k of Object.keys(iTimers)) clearTimeout(iTimers[k]);
    };
  }, []);

  const scheduleCountWrite = useCallback((dhikrId: string, count: number) => {
    const existing = countWriteTimers.current[dhikrId];
    if (existing) clearTimeout(existing);
    countWriteTimers.current[dhikrId] = setTimeout(() => {
      setCount(dhikrId, count).catch(() => {});
    }, WRITE_DEBOUNCE_MS);
  }, []);

  const scheduleIndexWrite = useCallback((categoryId: string, index: number) => {
    const existing = indexWriteTimers.current[categoryId];
    if (existing) clearTimeout(existing);
    indexWriteTimers.current[categoryId] = setTimeout(() => {
      setCategoryIndex(categoryId, index).catch(() => {});
    }, WRITE_DEBOUNCE_MS);
  }, []);

  const bumpConfetti = useCallback((id: string) => {
    setConfettiTicks((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);

  const clearAdvance = useCallback((id: string) => {
    const t = advanceTimers.current[id];
    if (t) {
      clearTimeout(t);
      delete advanceTimers.current[id];
    }
  }, []);

  const scheduleAdvance = useCallback(
    (id: string) => {
      clearAdvance(id);
      advanceTimers.current[id] = setTimeout(() => {
        setStates((prev) => {
          const list = dhikrsByCategory[id] ?? [];
          const cur = prev[id];
          if (!cur) return prev;
          const dhikr = list[cur.currentDhikrIndex];
          if (!dhikr) return prev;
          if ((cur.counts[dhikr.id] ?? 0) < dhikr.target) return prev;
          if (cur.currentDhikrIndex + 1 >= list.length) return prev;
          const nextIdx = cur.currentDhikrIndex + 1;
          const nextD = list[nextIdx];
          const counts = { ...cur.counts, [nextD.id]: cur.counts[nextD.id] ?? 0 };
          scheduleIndexWrite(id, nextIdx);
          return { ...prev, [id]: { currentDhikrIndex: nextIdx, counts } };
        });
      }, ADVANCE_DELAY_MS);
    },
    [dhikrsByCategory, scheduleIndexWrite, clearAdvance],
  );

  const incrementCurrent = useCallback(
    (id: CategoryId) => {
      setStates((prev) => {
        const list = dhikrsByCategory[id] ?? [];
        const cur = prev[id];
        if (!cur) return prev;
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
          if (cur.currentDhikrIndex + 1 < list.length) scheduleAdvance(id);
          scheduleCountWrite(dhikr.id, dhikr.target);
        } else {
          counts[dhikr.id] = newCount;
          hapticsLight();
          scheduleCountWrite(dhikr.id, newCount);
        }

        return {
          ...prev,
          [id]: { currentDhikrIndex: cur.currentDhikrIndex, counts },
        };
      });
    },
    [dhikrsByCategory, bumpConfetti, scheduleAdvance, scheduleCountWrite],
  );

  const decrementCurrent = useCallback(
    (id: CategoryId) => {
      setStates((prev) => {
        const list = dhikrsByCategory[id] ?? [];
        const cur = prev[id];
        if (!cur) return prev;
        const dhikr = list[cur.currentDhikrIndex];
        if (!dhikr) return prev;
        const currentCount = cur.counts[dhikr.id] ?? 0;
        if (currentCount <= 0) return prev;
        const newCount = currentCount - 1;
        const counts = { ...cur.counts, [dhikr.id]: newCount };
        hapticsLight();
        scheduleCountWrite(dhikr.id, newCount);
        return { ...prev, [id]: { ...cur, counts } };
      });
    },
    [dhikrsByCategory, scheduleCountWrite],
  );

  const nextDhikr = useCallback(
    (id: CategoryId) => {
      clearAdvance(id);
      setStates((prev) => {
        const list = dhikrsByCategory[id] ?? [];
        const cur = prev[id];
        if (!cur) return prev;
        if (cur.currentDhikrIndex + 1 >= list.length) return prev;
        const nextIdx = cur.currentDhikrIndex + 1;
        scheduleIndexWrite(id, nextIdx);
        return { ...prev, [id]: { ...cur, currentDhikrIndex: nextIdx } };
      });
    },
    [dhikrsByCategory, scheduleIndexWrite, clearAdvance],
  );

  const prevDhikr = useCallback(
    (id: CategoryId) => {
      clearAdvance(id);
      setStates((prev) => {
        const cur = prev[id];
        if (!cur) return prev;
        if (cur.currentDhikrIndex <= 0) return prev;
        const nextIdx = cur.currentDhikrIndex - 1;
        scheduleIndexWrite(id, nextIdx);
        return { ...prev, [id]: { ...cur, currentDhikrIndex: nextIdx } };
      });
    },
    [scheduleIndexWrite, clearAdvance],
  );

  const resetAll = useCallback(
    (id: CategoryId) => {
      clearAdvance(id);
      setStates((prev) => {
        const list = dhikrsByCategory[id] ?? [];
        const counts: Record<string, number> = {};
        for (const d of list) counts[d.id] = 0;
        return { ...prev, [id]: { currentDhikrIndex: 0, counts } };
      });
      resetCategoryCounts(id).catch(() => {});
    },
    [dhikrsByCategory, clearAdvance],
  );

  return (
    <CounterContext.Provider
      value={{
        hydrated,
        categories,
        dhikrsByCategory,
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

export const useDhikrContent = () => {
  const { categories, dhikrsByCategory, hydrated } = useCounterContext();
  return { categories, dhikrsByCategory, hydrated };
};
