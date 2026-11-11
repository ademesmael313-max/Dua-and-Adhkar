import type { CategoryId } from "./categories";

export interface Dua {
  id: string;
  categoryId: CategoryId;
  title: string;
  titleAr: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  /** Recommended number of repetitions */
  repeat: number;
  /** Virtue, context or etiquette */
  note?: string;
}
