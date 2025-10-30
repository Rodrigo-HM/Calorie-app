import { ListEntriesByDay } from "src/module/entries/aplication/use-cases/ListEntriesByDay";
import type { EntriesRepository } from "../../../src/module/entries/aplication/ports/EntriesRepository";
import type { FoodsReadRepository } from "../../../src/module/foods/aplication/ports/FoodsReadRepository";

const r1 = (n: number) => Number(n.toFixed(1));

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

describe("Entries.listByDay con totales (application)", () => {
  it("suma kcal y macros según grams y foods", async () => {
    // Arrange
    const foodsRepo = makeFoodsRepo([
      { id: "chicken", name: "Chicken", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
      { id: "rice", name: "Rice", kcal: 130, protein: 2.4, carbs: 28, fat: 0.3 },
    ]);

    const entriesRepo = makeEntriesRepoWith([
      { id: "e1", userId: "u1", foodId: "chicken", grams: 150, date: "2025-10-20T08:00:00.000Z" },
      { id: "e2", userId: "u1", foodId: "rice", grams: 200, date: "2025-10-20T13:00:00.000Z" },
    ]);

    const useCase = new ListEntriesByDay(entriesRepo, foodsRepo);

    // Act
    const out = await useCase.run("u1", "2025-10-20");

    // Assert
    expect(out.items).toHaveLength(2);
    // kcal: 165*1.5 + 130*2 = 507.5 → Math.round = 508
    expect(out.totals.kcal).toBe(508);
    expect(r1(out.totals.protein)).toBe(51.3);
    expect(r1(out.totals.carbs)).toBe(56.0);
    expect(r1(out.totals.fat)).toBe(6.0);
  });
});
