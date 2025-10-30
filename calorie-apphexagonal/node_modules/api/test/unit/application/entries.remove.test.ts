import { RemoveEntry } from "src/module/entries/aplication/use-cases/RemoveEntry";
import type { EntriesRepository, Entry } from "src/module/entries/aplication/ports/EntriesRepository";

// Fake repo que respeta el userId
function makeEntriesRepoWith(seed: Array<Partial<Entry> & { id: string; userId: string }>): EntriesRepository {
  const store: Entry[] = seed.map(s => ({
    id: s.id,
    userId: s.userId,
    foodId: s.foodId ?? "f1",
    grams: s.grams ?? 100,
    dateISO: s.dateISO ?? "2025-01-01T00:00:00.000Z",
    createdAt: s.createdAt ?? "now",
  }));

  return {
    async findByDay(userId, dayISO) {
      const start = `${dayISO}T00:00:00.000Z`;
      const end = `${dayISO}T23:59:59.999Z`;
      return store.filter(e => e.userId === userId && e.dateISO >= start && e.dateISO <= end);
    },
    async create(userId, data) {
      const item: Entry = { id: "e_new", userId, ...data, createdAt: "now" };
      store.push(item);
      return item;
    },
    async updateGramsForUser(id, userId, grams) {
      const i = store.findIndex(e => e.id === id && e.userId === userId);
      if (i === -1) return null;
      store[i] = { ...store[i], grams };
      return store[i];
    },
    async deleteByIdForUser(id, userId) {
      const i = store.findIndex(e => e.id === id && e.userId === userId);
      if (i === -1) return null;
      const [removed] = store.splice(i, 1);
      return removed ?? null;
    },
  };
}

describe("Entries.remove (application)", () => {
  it("elimina la entry si pertenece al usuario (no lanza)", async () => {
    const repo = makeEntriesRepoWith([{ id: "e1", userId: "u1", grams: 100 }]);
    const useCase = new RemoveEntry(repo);
    await expect(useCase.run("u1", "e1")).resolves.toBeUndefined();
  });

  it("lanza NOT_FOUND si no pertenece al usuario", async () => {
    const repo = makeEntriesRepoWith([{ id: "e1", userId: "u1", grams: 100 }]);
    const useCase = new RemoveEntry(repo);
    await expect(useCase.run("u2", "e1")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});