import { ListEntriesByDay } from "src/module/entries/aplication/list/ListEntriesByDay";
import type { EntriesRepository } from "../../../src/module/entries/aplication/ports/EntriesRepository";
import type { FoodsReadRepository } from "../../../src/module/foods/aplication/ports/FoodsReadRepository";

const r1 = (n: number) => Number(n.toFixed(1));

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

describe("Entries.listByDay con totales (application)", () => {
  it("suma kcal y macros según grams y foods", async () => {
    // Arrange
    const foodsRepo = makeFoodsRepo([
      { id: "chicken", name: "Chicken", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
      { id: "rice", name: "Rice", kcal: 130, protein: 2.4, carbs: 28, fat: 0.3 },
    ]);

    const entriesRepo = makeEntriesRepo([
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
