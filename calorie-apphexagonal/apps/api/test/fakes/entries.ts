import type {
  EntriesRepository,
  Entry,
} from "src/module/entries/aplication/ports/EntriesRepository";

type Seed = Partial<Entry> & { id: string; userId: string; dateISO?: string };

export function makeEntriesRepo(seed: Seed[] = []): EntriesRepository {
  // Normaliza el seed a Entry completo
  const store: Entry[] = seed.map((s) => ({
    id: s.id,
    userId: s.userId,
    foodId: s.foodId ?? "f1",
    grams: s.grams ?? 100,
    dateISO: s.dateISO ?? "2025-01-01T00:00:00.000Z",
    createdAt: s.createdAt ?? "now",
  }));

  return {
    async findByDay(userId: string, dayISO: string): Promise<Entry[]> {
      return store.filter(
        (e) => e.userId === userId && e.dateISO.slice(0, 10) === dayISO
      );
    },

    async create(
      userId: string,
      data: { foodId: string; grams: number; dateISO: string }
    ): Promise<Entry> {
      const item: Entry = {
        id: `e_${store.length + 1}`,
        userId,
        foodId: data.foodId,
        grams: data.grams,
        dateISO: data.dateISO,
        createdAt: "now",
      };
      store.push(item);
      return item;
    },

    async updateGramsForUser(
      id: string,
      userId: string,
      grams: number
    ): Promise<Entry | null> {
      const i = store.findIndex((e) => e.id === id && e.userId === userId);
      if (i === -1) return null;
      store[i] = { ...store[i], grams };
      return store[i];
    },

    async deleteByIdForUser(id: string, userId: string): Promise<Entry | null> {
      const i = store.findIndex((e) => e.id === id && e.userId === userId);
      if (i === -1) return null;
      const [removed] = store.splice(i, 1);
      return removed ?? null;
    },
  };
}