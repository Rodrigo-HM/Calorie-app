import type { EntriesRepository } from "src/module/entries/domain/EntriesRepository";
import { Entry, type EntryCreateProps } from "src/module/entries/domain/Entry";

export type Seed = Partial<EntryCreateProps> & { id: string; userId: string };

export function makeEntry(over: Seed) {
  return Entry.create({
    id: over.id,
    userId: over.userId,
    foodId: over.foodId ?? "f1",
    grams: over.grams ?? 100,
    dateISO: over.dateISO ?? "2025-10-20T08:00:00.000Z",
    createdAt: over.createdAt ?? "now",
  });
}

export function makeEntriesRepo(seed: Seed[] = []): EntriesRepository & {
  findByUserAndDay?: (userId: string, dayISO: string) => Promise<Entry[]>;
  findByDay?: (userId: string, dayISO: string) => Promise<Entry[]>; // compat si algún test lo usa
} {
  const store: Entry[] = seed.map(makeEntry);

  return {
    async listByUserAndDay(userId: string, dayISO: string) {
      const start = `${dayISO}T00:00:00.000Z`;
      const end   = `${dayISO}T23:59:59.999Z`;
      return store.filter(e => e.userId === userId && e.dateISO >= start && e.dateISO <= end);
    },
    // compat opcional
    async findByDay(userId: string, dayISO: string) {
      return this.listByUserAndDay(userId, dayISO);
    },
    async create(entry: Entry) {
      store.push(entry);
      return entry;
    },
    async updateGramsForUser(id: string, userId: string, grams: number) {
      const i = store.findIndex(e => e.id === id && e.userId === userId);
      if (i === -1) return null;
      const updated = store[i].withGrams(grams);
      store[i] = updated;
      return updated;
    },
    async deleteByIdForUser(id: string, userId: string) {
      const i = store.findIndex(e => e.id === id && e.userId === userId);
      if (i === -1) return null;
      const [removed] = store.splice(i, 1);
      return removed ?? null;
    },
  };
}