import type { Entry } from "../../domain/Entry";

export interface ICreateEntry {
  run(input: {
    userId: string;
    foodId: string;
    grams: number;
    date?: string; // puede ser YYYY-MM-DD o ISO; el use-case normaliza
  }): Promise<Entry>;
}

export interface IListEntriesByDay {
  run(
    userId: string,
    day: string
  ): Promise<{ items: Entry[]; totals: { kcal: number; protein: number; carbs: number; fat: number } }>;
}

export interface IUpdateEntryGrams {
  run(userId: string, entryId: string, grams: number): Promise<Entry>;
}

export interface IRemoveEntry {
  run(userId: string, entryId: string): Promise<void>;
}