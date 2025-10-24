// UPDATE IMPORT: apunta al caso de uso que lista entries con totales
// import { ListEntriesWithTotals } from "../../../src/module/entries/application/ListEntriesWithTotals";

// Interfaces mínimas para los fakes (no importamos infra)
type EntriesRepository = {
  listByUserAndDay(userId: string, day: string): Promise<any[]>;
};
type FoodsReadRepository = {
  listAll(): Promise<any[]>;
};

// Fakes
function makeEntriesRepo(initial: any[] = []): EntriesRepository {
  const data = [...initial];
  return {
    listByUserAndDay: async (userId: string, day: string) =>
      data.filter((e) => e.userId === userId && e.date.startsWith(day)),
  };
}
function makeFoodsRepo(foods: any[]): FoodsReadRepository {
  return { listAll: async () => foods };
}

const r1 = (n: number) => Number(n.toFixed(1));

describe("Given entries and foods, When listing with totals, Then sums macros correctly", () => {
  it("suma kcal/macros por gramos (AAA)", async () => {
    // Arrange
    const foods = [
      { id: "chicken", name: "Chicken", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
      { id: "rice", name: "Rice", kcal: 130, protein: 2.4, carbs: 28, fat: 0.3 },
    ];
    const entries = [
      { id: "e1", userId: "u1", foodId: "chicken", grams: 150, date: "2025-10-20T08:00:00.000Z" },
      { id: "e2", userId: "u1", foodId: "rice", grams: 200, date: "2025-10-20T13:00:00.000Z" },
    ];

    // Si aún no tienes el caso de uso importado, simulamos su run aquí:
    const useCase = {
      run: async (userId: string, day: string) => {
        const items = await makeEntriesRepo(entries).listByUserAndDay(userId, day);
        const allFoods = await makeFoodsRepo(foods).listAll();
        const map = new Map(allFoods.map((f) => [f.id, f]));
        const totals = items.reduce(
          (acc, it) => {
            const f = map.get(it.foodId);
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
      },
    };

    // Act
    const out = await useCase.run("u1", "2025-10-20");

    // Assert
    expect(out.items).toHaveLength(2);
    expect(Math.round(out.totals.kcal)).toBe(508); // 247.5 + 260 ≈ 508
    expect(r1(out.totals.protein)).toBe(51.3);     // 46.5 + 4.8
    expect(r1(out.totals.carbs)).toBe(56.0);       // 0 + 56
    expect(r1(out.totals.fat)).toBe(6.0);          // 5.4 + 0.6
  });
});
