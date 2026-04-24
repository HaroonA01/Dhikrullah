import { asc, eq, inArray, sql } from 'drizzle-orm';
import { db } from './index';
import {
  categories,
  categoryState,
  counters,
  dhikrs,
  favourites,
  meta,
} from './schema';

export const getCategories = () =>
  db.select().from(categories).orderBy(asc(categories.sortOrder));

export const getAllDhikrs = () =>
  db
    .select()
    .from(dhikrs)
    .orderBy(asc(dhikrs.categoryId), asc(dhikrs.sortOrder));

export const getDhikrsFor = (categoryId: string) =>
  db
    .select()
    .from(dhikrs)
    .where(eq(dhikrs.categoryId, categoryId))
    .orderBy(asc(dhikrs.sortOrder));

export const getAllCounters = () => db.select().from(counters);

export const getAllCategoryState = () => db.select().from(categoryState);

export const getAllFavouriteIds = () =>
  db.select({ id: favourites.dhikrId }).from(favourites);

export const getFavouriteDhikrs = () =>
  db
    .select({
      id: dhikrs.id,
      arabic: dhikrs.arabic,
      transliteration: dhikrs.transliteration,
      categoryId: dhikrs.categoryId,
      categoryLabel: categories.label,
      categorySortOrder: categories.sortOrder,
      dhikrSortOrder: dhikrs.sortOrder,
    })
    .from(favourites)
    .innerJoin(dhikrs, eq(favourites.dhikrId, dhikrs.id))
    .innerJoin(categories, eq(dhikrs.categoryId, categories.id))
    .orderBy(asc(categories.sortOrder), asc(dhikrs.sortOrder));

export const setCount = (dhikrId: string, count: number) =>
  db
    .insert(counters)
    .values({ dhikrId, count, updatedAt: sql`(unixepoch())` })
    .onConflictDoUpdate({
      target: counters.dhikrId,
      set: { count, updatedAt: sql`(unixepoch())` },
    });

export const setCategoryIndex = (categoryId: string, currentDhikrIndex: number) =>
  db
    .insert(categoryState)
    .values({ categoryId, currentDhikrIndex, updatedAt: sql`(unixepoch())` })
    .onConflictDoUpdate({
      target: categoryState.categoryId,
      set: { currentDhikrIndex, updatedAt: sql`(unixepoch())` },
    });

export const addFavourite = (dhikrId: string) =>
  db.insert(favourites).values({ dhikrId }).onConflictDoNothing();

export const removeFavourite = (dhikrId: string) =>
  db.delete(favourites).where(eq(favourites.dhikrId, dhikrId));

export const resetCategoryCounts = (categoryId: string) =>
  db.transaction(async (tx) => {
    const ds = await tx
      .select({ id: dhikrs.id })
      .from(dhikrs)
      .where(eq(dhikrs.categoryId, categoryId));
    if (ds.length) {
      await tx
        .update(counters)
        .set({ count: 0, updatedAt: sql`(unixepoch())` })
        .where(
          inArray(
            counters.dhikrId,
            ds.map((d) => d.id),
          ),
        );
    }
    await tx
      .insert(categoryState)
      .values({ categoryId, currentDhikrIndex: 0, updatedAt: sql`(unixepoch())` })
      .onConflictDoUpdate({
        target: categoryState.categoryId,
        set: { currentDhikrIndex: 0, updatedAt: sql`(unixepoch())` },
      });
  });

export async function getMeta(key: string): Promise<string | null> {
  const rows = await db.select().from(meta).where(eq(meta.key, key)).limit(1);
  return rows[0]?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  await db
    .insert(meta)
    .values({ key, value })
    .onConflictDoUpdate({ target: meta.key, set: { value } });
}
