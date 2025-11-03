import type { Entry } from "src/module/entries/domain/Entry";

// DTO plano (sin métodos de clase)
export type EntryDTO = {
  id: string;
  userId: string;
  foodId: string;
  grams: number;
  dateISO: string;
  createdAt: string;
};

export type EntryView = EntryDTO & { date: string }; // compat: añadimos 'date'

function toDTO(e: Entry): EntryDTO {
  return {
    id: e.id,
    userId: e.userId,
    foodId: e.foodId,
    grams: e.grams,
    dateISO: e.dateISO,
    createdAt: e.createdAt,
  };
}

export function presentEntry(e: Entry): EntryView {
  const dto = toDTO(e);
  return { ...dto, date: dto.dateISO }; // compat legacy: date = dateISO
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