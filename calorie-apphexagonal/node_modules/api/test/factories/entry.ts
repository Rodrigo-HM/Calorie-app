export type Entry = {
  id: string;
  userId: string;
  foodId: string;
  grams: number;
  date: string; // ISO
};

export function makeEntry(over: Partial<Entry> = {}): Entry {
  return {
    id: over.id ?? "e_" + Math.random().toString(36).slice(2, 8),
    userId: over.userId ?? "u1",
    foodId: over.foodId ?? "food1",
    grams: over.grams ?? 100,
    date: over.date ?? "2025-10-20T08:00:00.000Z",
  };
}
