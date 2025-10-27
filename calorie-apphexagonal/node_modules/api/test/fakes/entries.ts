import type { EntriesRepository } from "../../src/module/entries/aplication/ports/EntriesRepository";

type Entry = {
  id: string;
  userId: string;
  grams: number;
  date?: string;
  foodId?: string;
};

export function makeEntriesRepo(initial: Entry[] = []): EntriesRepository {
  const data = [...initial];

  return {
    async save(entry: any) {
      data.push(entry);
    },

    async findByDay(userId: string, dayISO: string) {
      return data.filter(
        (e) => e.userId === userId && (e as any).date?.startsWith?.(dayISO)
      );
    },

    async updateGramsForUser(id: string, userId: string, grams: number) {
      const it = data.find((e) => e.id === id && e.userId === userId);
      if (!it) return null;
      (it as any).grams = grams;
      return it as any;
    },

    async deleteByIdForUser(id: string, userId: string) {
      const idx = data.findIndex((e) => e.id === id && e.userId === userId);
      if (idx === -1) return null;
      const [removed] = data.splice(idx, 1);
      return removed as any;
    },

    // opcional:
    // __peek: () => data
  };
}
