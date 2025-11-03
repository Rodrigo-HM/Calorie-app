import { ListEntriesByDay } from "src/module/entries/application/use-cases/ListEntriesByDay";
import type { EntriesRepository } from "src/module/entries/domain/EntriesRepository";
import { Entry, type EntryCreateProps } from "src/module/entries/domain/Entry";
import type { FoodsReadRepository } from "src/module/foods/application/ports/FoodsReadRepository";

type Seed = Partial<EntryCreateProps> & { id: string; userId: string };

function makeEntry(over: Seed) {
  return Entry.create({
    id: over.id,
    userId: over.userId,
    foodId: over.foodId ?? "food1",
    grams: over.grams ?? 150,
    dateISO: over.dateISO ?? "2025-11-03T10:00:00.000Z",
    createdAt: over.createdAt ?? "now",
  });
}

function makeEntriesRepoWith(items: Seed[]): EntriesRepository {
  const store = items.map(makeEntry);
  return {
    async listByUserAndDay(_userId: string, dayISO: string) {
      const start = `${dayISO}T00:00:00.000Z`;
      const end   = `${dayISO}T23:59:59.999Z`;
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

describe("Entries.listByUserAndDay (totals)", () => {
  it("calcula totals a partir de gramos y macros del alimento", async () => {
    // 150g de food1 (100 kcal/100g => 150 kcal)
    const entriesRepo = makeEntriesRepoWith([{ id: "e1", userId: "u1", foodId: "food1", grams: 150, dateISO: "2025-11-03T10:00:00.000Z" }]);
    const foodsRepo = makeFoodsRepo([{ id: "food1", name: "X", kcal: 100, protein: 10, carbs: 10, fat: 5 }]);

    const uc = new ListEntriesByDay(entriesRepo, foodsRepo);
    const out = await uc.run("u1", "2025-11-03");

    expect(out.items.map(x => x.id)).toEqual(["e1"]);
    expect(Math.round(out.totals.kcal)).toBe(150);
    expect(Math.round(out.totals.protein)).toBe(15);
    expect(Math.round(out.totals.carbs)).toBe(15);
    expect(Math.round(out.totals.fat)).toBe(8);
  });
});