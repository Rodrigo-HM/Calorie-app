import { RemoveEntry } from "src/module/entries/application/use-cases/RemoveEntry";
import type { EntriesRepository } from "src/module/entries/domain/EntriesRepository";
import { Entry, type EntryCreateProps } from "src/module/entries/domain/Entry";

type Seed = Partial<EntryCreateProps> & { id: string; userId: string };

function makeEntry(over: Seed) {
  return Entry.create({
    id: over.id,
    userId: over.userId,
    foodId: over.foodId ?? "f1",
    grams: over.grams ?? 100,
    dateISO: over.dateISO ?? "2025-10-20T08:00:00.000Z",
    createdAt: over.createdAt ?? "now",
  });
}

function makeEntriesRepo(seed: Seed[] = []): EntriesRepository {
  const store = seed.map(makeEntry);
  return {
    async listByUserAndDay(userId, dayISO) {
      const start = `${dayISO}T00:00:00.000Z`;
      const end   = `${dayISO}T23:59:59.999Z`;
      return store.filter(e => e.userId === userId && e.dateISO >= start && e.dateISO <= end);
    },
    async create(entry) { store.push(entry); return entry; },
    async updateGramsForUser(id, userId, grams) {
      const i = store.findIndex(e => e.id === id && e.userId === userId);
      if (i === -1) return null;
      const updated = store[i].withGrams(grams);
      store[i] = updated;
      return updated;
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
    const repo = makeEntriesRepo([{ id: "e1", userId: "u1", grams: 100 }]);
    const useCase = new RemoveEntry(repo);
    await expect(useCase.run("u1", "e1")).resolves.toBeUndefined();
  });

  it("lanza NOT_FOUND si no pertenece al usuario", async () => {
    const repo = makeEntriesRepo([{ id: "e1", userId: "u1", grams: 100 }]);
    const useCase = new RemoveEntry(repo);
    await expect(useCase.run("u2", "e1")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});