import type { EntriesRepository } from "../../../src/module/entries/aplication/ports/EntriesRepository";
import type { FoodsReadRepository } from "../../../src/module/foods/aplication/ports/FoodsReadRepository";

function makeEntriesRepo(initial: any[] = []): EntriesRepository {
  const data = [...initial];
  return {
    async save(_entry: any): Promise<void> {},
    async findByDay(userId: string, dayISO: string): Promise<any[]> {
      return data.filter(e => e.userId === userId && e.date.startsWith(dayISO));
    },
    async updateGramsForUser(_id: string, _userId: string, _grams: number): Promise<any | null> { return null; },
    async deleteByIdForUser(_id: string, _userId: string): Promise<any | null> { return null; },
  };
}

function makeFoodsRepo(foods: any[]): FoodsReadRepository {
  return {
    async listAll() { return foods; },
    async getById(id: string) { return foods.find(f => f.id === id) ?? null; },
  };
}

const r1 = (n: number) => Number(n.toFixed(1));

describe("Entries.listByDay con totales (application)", () => {
  it("suma kcal y macros según grams y foods", async () => {
    // Arrange
    const foods = makeFoodsRepo([
      { id: "chicken", name: "Chicken", kcal: 165, protein: 31, carbs: 0,  fat: 3.6 },
      { id: "rice",    name: "Rice",    kcal: 130, protein: 2.4, carbs: 28, fat: 0.3 },
    ]);
    const entriesRepo = makeEntriesRepo([
      { id: "e1", userId: "u1", foodId: "chicken", grams: 150, date: "2025-10-20T08:00:00.000Z" }, // factor 1.5
      { id: "e2", userId: "u1", foodId: "rice",    grams: 200, date: "2025-10-20T13:00:00.000Z" }, // factor 2.0
    ]);

// Use case inline (reemplázalo por tu ListEntriesWithTotals real si lo tienes)
const listWithTotals = async (userId: string, dayISO: string) => {
  const items = await entriesRepo.findByDay(userId, dayISO);
  const allFoods = await foods.listAll();
  // tipa la comida para ayudar a TS
  type Food = { id: string; kcal: number; protein: number; carbs: number; fat: number };
  const byId = new Map<string, Food>(allFoods.map((f: any) => [f.id as string, f as Food]));

  // Guard: si falta algún food, tratamos como error de datos
  for (const it of items) {
    if (!byId.has(it.foodId)) {
      const err: any = new Error("FOOD_NOT_FOUND");
      err.code = "FOOD_NOT_FOUND";
      throw err;
    }
  }

  const totals = items.reduce(
    (acc, it) => {
      const f = byId.get(it.foodId)!; // ahora TS sabe que existe por el guard anterior
      const factor = it.grams / 100;
      acc.kcal += f.kcal * factor;
      acc.protein += f.protein * factor;
      acc.carbs += f.carbs * factor;
      acc.fat += f.fat * factor;
      return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { items, totals };
};


    // Act
    const out = await listWithTotals("u1", "2025-10-20");

    // Assert
    expect(out.items).toHaveLength(2);
    // chicken 150g => 247.5 kcal, P 46.5, C 0, F 5.4
    // rice    200g => 260.0 kcal, P  4.8, C 56, F 0.6
    expect(Math.round(out.totals.kcal)).toBe(508);
    expect(r1(out.totals.protein)).toBe(51.3);
    expect(r1(out.totals.carbs)).toBe(56.0);
    expect(r1(out.totals.fat)).toBe(6.0);
  });
});
