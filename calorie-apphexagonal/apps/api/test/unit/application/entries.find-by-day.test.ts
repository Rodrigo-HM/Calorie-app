import { ListEntriesByDay } from "src/module/entries/aplication/list/ListEntriesByDay";
import type { EntriesRepository } from "../../../src/module/entries/aplication/ports/EntriesRepository";
import type { FoodsReadRepository } from "../../../src/module/foods/aplication/ports/FoodsReadRepository";

function makeEntriesRepo(initial: any[] = []): EntriesRepository {
  const data = [...initial];
  return {
    async save(_e: any) {},
    async findByDay(userId: string, dayISO: string) {
      return data.filter(e => e.userId === userId && e.date.startsWith(dayISO));
    },
    async updateGramsForUser() { return null; },
    async deleteByIdForUser() { return null; },
  };
}

function makeFoodsRepo(foods: any[]): FoodsReadRepository {
  return {
    async listAll() { return foods; },
    async getById(id: string) { return foods.find(f => f.id === id) ?? null; },
  };
}

describe("Entries.findByDay shape { items, totals }", () => {
  it("delegates a repos y retorna { items, totals }", async () => {
    const entriesRepo = makeEntriesRepo([
      { id: "e1", userId: "u1", foodId: "a", grams: 100, date: "2025-10-20T08:00:00.000Z" },
    ]);
    const foodsRepo = makeFoodsRepo([
      { id: "a", name: "X", kcal: 100, protein: 10, carbs: 10, fat: 5 },
    ]);

    const useCase = new ListEntriesByDay(entriesRepo, foodsRepo);
    const out = await useCase.run("u1", "2025-10-20");

    expect(out.items.map(x => x.id)).toEqual(["e1"]);
    expect(out.totals.kcal).toBe(100);
  });
});
