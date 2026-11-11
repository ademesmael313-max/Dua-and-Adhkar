import type { CategoryId } from "../categories";
import type { Dua } from "../types";
import { morningEveningDuas } from "./morningEvening";
import { quranDuas, salahDuas } from "./quranSalah";
import { ruqyaDuas } from "./healing";
import { distressDuas, forgivenessDuas } from "./comfort";
import { travelDuas, dailyDuas } from "./life";

export const duas: Dua[] = [
  ...morningEveningDuas,
  ...quranDuas,
  ...salahDuas,
  ...ruqyaDuas,
  ...distressDuas,
  ...forgivenessDuas,
  ...travelDuas,
  ...dailyDuas,
];

export const duaById = (id: string): Dua | undefined => duas.find((d) => d.id === id);

export const duasInCategory = (id: CategoryId): Dua[] =>
  duas.filter((d) => d.categoryId === id);

export const categoryCounts = (): Record<CategoryId, number> =>
  duas.reduce(
    (acc, dua) => {
      acc[dua.categoryId] = (acc[dua.categoryId] ?? 0) + 1;
      return acc;
    },
    {} as Record<CategoryId, number>,
  );

/** A short, readable dua featured each day. */
// Long chapters are excluded so the daily card stays readable on a phone.
const dailyPool = duas.filter((d) => d.repeat === 1 && !d.id.includes("ayat-al-kursi"));

export const duaOfTheDay = (date: Date = new Date()): Dua => {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return dailyPool[day % dailyPool.length] ?? duas[0];
};

export type { Dua };
