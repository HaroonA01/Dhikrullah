import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getJSON, setJSON, storageKey } from '@/lib/storage';

const STORAGE_KEY = storageKey('favourites:ids');

interface ContextValue {
  hydrated: boolean;
  favouriteIds: Set<string>;
  toggle: (id: string) => void;
  isFavourite: (id: string) => boolean;
}

const FavouritesContext = createContext<ContextValue | null>(null);

export const FavouritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getJSON<string[]>(STORAGE_KEY);
      if (!cancelled) {
        setFavouriteIds(new Set(stored ?? []));
        setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggle = useCallback((id: string) => {
    setFavouriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setJSON(STORAGE_KEY, Array.from(next));
      return next;
    });
  }, []);

  const isFavourite = useCallback((id: string) => favouriteIds.has(id), [favouriteIds]);

  return (
    <FavouritesContext.Provider value={{ hydrated, favouriteIds, toggle, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = (): ContextValue => {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used inside FavouritesProvider');
  return ctx;
};
