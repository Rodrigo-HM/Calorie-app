import { UpdateEntryGrams } from "src/module/entries/aplication/use-cases/UpdateEntryGrams";
import type { EntriesRepository, Entry } from "src/module/entries/aplication/ports/EntriesRepository";

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
    async findByDay() { return store; },
    async create(userId, data) {
      const item: Entry = { id: "e_new", userId, ...data, createdAt: "now" };
      store.push(item); return item;
    },
    async updateGramsForUser(id, userId, grams) {
      const i = store.findIndex(e => e.id === id && e.userId === userId);
      if (i === -1) return null;                 // clave: respeta userId
      store[i] = { ...store[i], grams }; return store[i];
    },
    async deleteByIdForUser() { return null; },
  };
}

describe("Entries.update grams (application)", () => {
  it("actualiza si pertenece al usuario", async () => {
    const repo = makeEntriesRepoWith([{ id: "e1", userId: "u1", grams: 100 }]);
    const uc = new UpdateEntryGrams(repo);
    const out = await uc.run("u1", "e1", 200);
    expect(out.grams).toBe(200);
  });

  it("lanza NOT_FOUND si no pertenece al usuario", async () => {
    const repo = makeEntriesRepoWith([{ id: "e1", userId: "u1", grams: 100 }]);
    const uc = new UpdateEntryGrams(repo);
    await expect(uc.run("u2", "e1", 200)).rejects.toMatchObject({ name: "DomainError", message: "NOT_FOUND" });
  });
});