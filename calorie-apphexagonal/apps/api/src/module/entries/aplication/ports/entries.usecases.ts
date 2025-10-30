import type { Entry } from "./EntriesRepository";

export interface ICreateEntry {
  run(
    userId: string,
    input: { foodId: string; grams: number; dateISO: string }
  ): Promise<Entry>;
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