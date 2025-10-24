import type { EntriesRepository } from "../../../src/module/entries/aplication/ports/EntriesRepository";
import type { FoodsReadRepository } from "../../../src/module/foods/aplication/ports/FoodsReadRepository";

// Fakes alineados a tus interfaces reales
function makeEntriesRepo() {
  const saved: any[] = [];
  const repo: EntriesRepository = {
    async save(entry: any): Promise<void> { saved.push(entry); },
    async findByDay(_userId: string, _dayISO: string): Promise<any[]> { return []; },
    async updateGramsForUser(_id: string, _userId: string, _grams: number): Promise<any | null> { return null; },
    async deleteByIdForUser(_id: string, _userId: string): Promise<any | null> { return null; },
  };
  return { repo, saved };
}

function makeFoodsRepo(foods: any[]): FoodsReadRepository {
  return {
    async listAll() { return foods; },
    async getById(id: string) { return foods.find(f => f.id === id) ?? null; },
  };
}

describe("Entries.create (application) con FoodsReadRepository", () => {
  it("happy path: guarda entry cuando el food existe", async () => {
    const { repo, saved } = makeEntriesRepo();
    const foods = makeFoodsRepo([{ id: "food_chicken", name: "Chicken", kcal: 165, protein: 31, carbs: 0, fat: 3.6 }]);

    // Use case inline (reemplázalo por tu CreateEntry real si lo tienes)
    const createEntry = async (userId: string, p: { foodId: string; grams: number; dateISO: string }) => {
      const found = await foods.getById(p.foodId);
      if (!found) {
        const err: any = new Error("FOOD_NOT_FOUND");
        err.code = "FOOD_NOT_FOUND";
        throw err;
      }
      const entry = { id: "e1", userId, ...p };
      await repo.save(entry);
      return entry;
    };

    const out = await createEntry("u1", { foodId: "food_chicken", grams: 150, dateISO: "2025-10-20T10:00:00.000Z" });
    expect(out.id).toBe("e1");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ userId: "u1", foodId: "food_chicken", grams: 150 });
  });

  it("guard: lanza FOOD_NOT_FOUND cuando el food no existe", async () => {
    const { repo } = makeEntriesRepo();
    const foods = makeFoodsRepo([]); // vacío

    const createEntry = async () => {
      const found = await foods.getById("nope");
      if (!found) {
        const err: any = new Error("FOOD_NOT_FOUND");
        err.code = "FOOD_NOT_FOUND";
        throw err;
      }
      await repo.save({}); // no se ejecuta
    };

    await expect(createEntry()).rejects.toMatchObject({ code: "FOOD_NOT_FOUND" });
  });
});
