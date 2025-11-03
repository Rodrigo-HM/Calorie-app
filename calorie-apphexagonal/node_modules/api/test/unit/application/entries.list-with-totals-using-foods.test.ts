import { ListEntriesByDay } from "src/module/entries/application/use-cases/ListEntriesByDay";
import type { EntriesRepository } from "src/module/entries/domain/EntriesRepository";
import { Entry, type EntryCreateProps } from "src/module/entries/domain/Entry";
import type { FoodsReadRepository } from "src/module/foods/application/ports/FoodsReadRepository";

type Seed = Partial<EntryCreateProps> & { id: string; userId: string };

function makeEntry(over: Seed) {
  return Entry.create({
    id: over.id,
    userId: over.userId,
    foodId: over.foodId ?? "a",
    grams: over.grams ?? 120,
    dateISO: over.dateISO ?? "2025-11-03T08:00:00.000Z",
    createdAt: over.createdAt ?? "now",
  });
}

function makeEntriesRepoWith(items: Seed[]): EntriesRepository {
  const store = items.map(makeEntry);
  return {
    async listByUserAndDay(_userId: string, dayISO: string) {
      const start = `${dayISO}T00:00:00.000Z`; const end = `${dayISO}T23:59:59.999Z`;
      return store.filter(e => e.dateISO >= start && e.dateISO <= end);
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

function makeFoodsRepo(list: Array<{ id: string; name: string; kcal: number; protein: number; carbs: number; fat: number }>): FoodsReadRepository {
  return {
    async getById(id: string) { return list.find(x => x.id === id) ?? null; },
    async listAll() { return list; },
  };
}

describe("Entries.listByUserAndDay con varios foods", () => {
  it("suma totals de varias entries y foods distintos", async () => {
    const entriesRepo = makeEntriesRepoWith([
      { id: "e1", userId: "u1", foodId: "a", grams: 100, dateISO: "2025-11-03T07:00:00.000Z" },
      { id: "e2", userId: "u1", foodId: "b", grams: 50,  dateISO: "2025-11-03T12:00:00.000Z" },
    ]);
    const foodsRepo = makeFoodsRepo([
      { id: "a", name: "FoodA", kcal: 200, protein: 20, carbs: 10, fat: 5 },
      { id: "b", name: "FoodB", kcal: 100, protein: 10, carbs: 20, fat: 2 },
    ]);

    const uc = new ListEntriesByDay(entriesRepo, foodsRepo);
    const out = await uc.run("u1", "2025-11-03");

    // e1: 100% de 'a' -> 200 kcal; e2: 50% de 'b' -> 50 kcal => total 250
    expect(Math.round(out.totals.kcal)).toBe(250);
    expect(out.items.map(x => x.id)).toEqual(["e1","e2"]);
  });
});