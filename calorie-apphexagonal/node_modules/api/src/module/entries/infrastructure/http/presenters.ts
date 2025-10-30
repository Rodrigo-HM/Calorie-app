import type { Entry } from "src/module/entries/aplication/ports/EntriesRepository";

export type EntryView = Entry & { date: string }; // compat: añadimos 'date'

export function presentEntry(e: Entry): EntryView {
  return { ...e, date: e.dateISO }; // compat legacy: date = dateISO
}

export function presentEntriesWithTotals(
  items: Entry[],
  totals: { kcal: number; protein: number; carbs: number; fat: number }
) {
  return {
    items: items.map(presentEntry),
    totals,
  };
}