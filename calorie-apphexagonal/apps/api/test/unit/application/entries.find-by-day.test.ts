import { ListEntriesByDay } from "src/module/entries/aplication/use-cases/ListEntriesByDay";
import type { EntriesRepository } from "../../../src/module/entries/aplication/ports/EntriesRepository";
import type { FoodsReadRepository } from "../../../src/module/foods/aplication/ports/FoodsReadRepository";

function makeEntriesRepoWith(items: any[]): EntriesRepository {
  return {
    async findByDay(_userId: string, _dayISO: string) { return items; },
    async create(userId, data) { return { id: "e1", userId, ...data, createdAt: "now" }; },
    async updateGramsForUser(id, userId, grams) { return { id, userId, foodId: "f1", grams, dateISO: "2025-01-01T00:00:00.000Z", createdAt: "now" }; },
    async deleteByIdForUser(id, userId) { return { id, userId, foodId: "f1", grams: 100, dateISO: "2025-01-01T00:00:00.000Z", createdAt: "now" }; },
  };
}

function makeFoodsRepo(list: any[]): FoodsReadRepository {
  return {
    async getById(id: string) { return list.find(x => x.id === id) ?? null; },
    async listAll() { return list; },
  };
}

describe("Entries.findByDay shape { items, totals }", () => {
  it("retorna { items, totals }", async () => {
    const entriesRepo = makeEntriesRepoWith([
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
