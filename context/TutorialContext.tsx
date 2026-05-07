import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Dimensions, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { usePrefs } from '@/context/PrefsContext';

export type HintKind = 'tap' | 'swipeH' | 'swipeV' | 'longPress' | null;

export interface TutorialStep {
  id: string;
  route?: string;
  targetId?: string | null;
  hint?: HintKind;
  title: string;
  body: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TutorialContextValue {
  active: boolean;
  index: number;
  total: number;
  current: TutorialStep | null;
  rect: Rect | null;
  start: () => void;
  stop: (persist: boolean) => void;
  next: () => void;
  prev: () => void;
  registerTarget: (id: string, ref: React.RefObject<View | null>) => () => void;
  remeasure: () => void;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    route: '/(tabs)',
    title: 'As-salamu alaykum',
    body: 'Quick tour of Dhikrullah. Tap Next to continue, or Skip anytime.',
  },
  {
    id: 'tab.home',
    route: '/(tabs)',
    targetId: 'tab.index',
    hint: 'tap',
    title: 'Home',
    body: 'Today’s prayer windows and dhikr categories live here.',
  },
  {
    id: 'home.category',
    route: '/(tabs)',
    targetId: 'home.firstCategory',
    hint: 'tap',
    title: 'Categories',
    body: 'Tap a category card to start counting. Let’s try one.',
  },
  {
    id: 'counter.tile',
    route: '/tutorial-counter',
    targetId: 'counter.tile',
    hint: 'tap',
    title: 'Tap to count',
    body: 'Tap the centre of the tile to increment your count.',
  },
  {
    id: 'counter.pager',
    route: '/tutorial-counter',
    targetId: 'counter.pager',
    hint: 'swipeH',
    title: 'Swipe to translate',
    body: 'Swipe across the text to see Arabic, transliteration, and translation.',
  },
  {
    id: 'counter.plus',
    route: '/tutorial-counter',
    targetId: 'counter.plus',
    hint: 'tap',
    title: 'Plus',
    body: 'The + pill counts too — useful when your thumb is on the bottom.',
  },
  {
    id: 'counter.minus',
    route: '/tutorial-counter',
    targetId: 'counter.minus',
    hint: 'tap',
    title: 'Minus',
    body: 'Made a mistake? − removes the last count.',
  },
  {
    id: 'counter.heart',
    route: '/tutorial-counter',
    targetId: 'counter.heart',
    hint: 'tap',
    title: 'Favourite',
    body: 'Save this dhikr to Favourites for quick access.',
  },
  {
    id: 'counter.next',
    route: '/tutorial-counter',
    targetId: 'counter.arrowRight',
    hint: 'tap',
    title: 'Next dhikr',
    body: 'When you finish, the right arrow advances to the next one.',
  },
  {
    id: 'counter.prev',
    route: '/tutorial-counter',
    targetId: 'counter.arrowLeft',
    hint: 'tap',
    title: 'Previous',
    body: 'Go back to a prior dhikr at any time.',
  },
  {
    id: 'counter.info',
    route: '/tutorial-counter',
    targetId: 'counter.info',
    hint: 'tap',
    title: 'Info',
    body: 'Tap the corner i for the source and grading of each dhikr.',
  },
  {
    id: 'counter.audio',
    route: '/tutorial-counter',
    targetId: 'counter.audio',
    hint: 'tap',
    title: 'Audio',
    body: 'Hear the dhikr recited aloud.',
  },
  {
    id: 'tab.fav',
    route: '/(tabs)/favourites',
    targetId: 'tab.favourites',
    hint: 'tap',
    title: 'Favourites',
    body: 'Everything you’ve hearted, in one place.',
  },
  {
    id: 'tab.stats',
    route: '/(tabs)/stats',
    targetId: 'tab.stats',
    hint: 'tap',
    title: 'Stats',
    body: 'Streaks, daily totals, and lifetime time spent in dhikr.',
  },
  {
    id: 'tab.share',
    route: '/(tabs)/share',
    targetId: 'tab.share',
    hint: 'tap',
    title: 'Share',
    body: 'Send a dhikr or your stats to a friend.',
  },
  {
    id: 'tab.settings',
    route: '/(tabs)/settings',
    targetId: 'tab.settings',
    hint: 'tap',
    title: 'Settings',
    body: 'Themes, fonts, prayer methods, and notifications.',
  },
  {
    id: 'settings.help',
    route: '/(tabs)/settings',
    targetId: 'settings.help',
    hint: 'tap',
    title: 'Replay anytime',
    body: 'Help → Replay tutorial brings this back whenever you need it.',
  },
  {
    id: 'done',
    route: '/(tabs)',
    title: 'You’re set.',
    body: 'Barakallahu feek. Begin.',
  },
];

const TUTORIAL_TOTAL = TUTORIAL_STEPS.length;

interface ProviderProps {
  children: React.ReactNode;
}

export const TutorialProvider: React.FC<ProviderProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, tutorialCompleted, setTutorialCompleted } = usePrefs();

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rects, setRects] = useState<Record<string, Rect>>({});

  const targetsRef = useRef<Map<string, React.RefObject<View | null>>>(new Map());
  const autoStartedRef = useRef(false);
  const measureScheduledRef = useRef(false);

  const current: TutorialStep | null = active ? (TUTORIAL_STEPS[index] ?? null) : null;
  const rect = current?.targetId ? rects[current.targetId] ?? null : null;

  const remeasure = useCallback(() => {
    if (measureScheduledRef.current) return;
    measureScheduledRef.current = true;
    requestAnimationFrame(() => {
      measureScheduledRef.current = false;
      const next: Record<string, Rect> = {};
      targetsRef.current.forEach((ref, id) => {
        const node = ref.current;
        if (!node) return;
        node.measureInWindow((x, y, width, height) => {
          if (width <= 0 || height <= 0) return;
          next[id] = { x, y, width, height };
          setRects((prev) => {
            const cur = prev[id];
            if (cur && cur.x === x && cur.y === y && cur.width === width && cur.height === height) {
              return prev;
            }
            return { ...prev, [id]: { x, y, width, height } };
          });
        });
      });
    });
  }, []);

  const registerTarget = useCallback(
    (id: string, ref: React.RefObject<View | null>) => {
      targetsRef.current.set(id, ref);
      remeasure();
      return () => {
        const cur = targetsRef.current.get(id);
        if (cur === ref) {
          targetsRef.current.delete(id);
          setRects((prev) => {
            if (!(id in prev)) return prev;
            const { [id]: _gone, ...rest } = prev;
            return rest;
          });
        }
      };
    },
    [remeasure],
  );

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  const stop = useCallback(
    (persist: boolean) => {
      setActive(false);
      if (persist) setTutorialCompleted(true);
    },
    [setTutorialCompleted],
  );

  const next = useCallback(() => {
    setIndex((prev) => {
      if (prev >= TUTORIAL_TOTAL - 1) {
        setActive(false);
        setTutorialCompleted(true);
        return prev;
      }
      return prev + 1;
    });
  }, [setTutorialCompleted]);

  const prev = useCallback(() => {
    setIndex((p) => Math.max(0, p - 1));
  }, []);

  // Auto-start once on first launch after hydration.
  useEffect(() => {
    if (!hydrated) return;
    if (tutorialCompleted) return;
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    const t = setTimeout(() => setActive(true), 4400);
    return () => clearTimeout(t);
  }, [hydrated, tutorialCompleted]);

  // Drive route changes per step.
  useEffect(() => {
    if (!active) return;
    const step = TUTORIAL_STEPS[index];
    if (!step?.route) return;
    if (pathname === step.route) return;
    if (step.route === '/(tabs)' && (pathname === '/' || pathname === '/(tabs)' || pathname?.startsWith('/(tabs)'))) {
      // already inside tabs; no nav needed unless mismatched
      if (pathname === '/(tabs)' || pathname === '/') return;
    }
    router.replace(step.route as never);
  }, [active, index, pathname, router]);

  // Re-measure on layout/dimension changes.
  useEffect(() => {
    if (!active) return;
    const sub = Dimensions.addEventListener('change', () => remeasure());
    return () => sub.remove();
  }, [active, remeasure]);

  // Re-measure when step index changes (gives new screen targets time to mount).
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(remeasure, 120);
    return () => clearTimeout(t);
  }, [active, index, remeasure]);

  // Dismiss on background; restart fresh on next launch.
  useEffect(() => {
    if (!active) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') setActive(false);
    });
    return () => sub.remove();
  }, [active]);

  const value = useMemo<TutorialContextValue>(
    () => ({
      active,
      index,
      total: TUTORIAL_TOTAL,
      current,
      rect,
      start,
      stop,
      next,
      prev,
      registerTarget,
      remeasure,
    }),
    [active, index, current, rect, start, stop, next, prev, registerTarget, remeasure],
  );

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
};

export const useTutorial = (): TutorialContextValue => {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error('useTutorial must be used inside TutorialProvider');
  return ctx;
};
