// UPDATE IMPORT: tu caso de uso real GoalsService / SetGoals / GetGoals
// import { SetGoals, GetGoals } from "../../../src/module/goals/application/...";
// import type { GoalsRepository } from "../../../src/module/goals/application/ports/GoalsRepository";

type Goals = { userId: string; kcal: number; protein: number; carbs: number; fat: number };
type GoalsRepository = {
  get(userId: string): Promise<Goals | null>;
  set(userId: string, data: Omit<Goals, "userId">): Promise<Goals>;
};

function makeGoalsRepo(initial: Goals | null = null): GoalsRepository {
  let store = initial;
  return {
    get: async (_userId) => store,
    set: async (userId, d) => (store = { userId, ...d })!,
  };
}

describe("Given goals payload, When setting, Then normalize and get returns same values", () => {
  it("normaliza kcal/calories (si lo soportas) y persiste", async () => {
    const repo = makeGoalsRepo(null);

    // Simula tu service: normaliza { calories } → { kcal }
    const set = async (userId: string, input: any) => {
      const kcal = input.kcal ?? input.calories;
      const data = { kcal, protein: input.protein ?? 0, carbs: input.carbs ?? 0, fat: input.fat ?? 0 };
      return repo.set(userId, data);
    };
    const get = async (userId: string) => repo.get(userId);

    await set("u1", { calories: 2000, protein: 120 });
    const out = await get("u1");
    expect(out?.kcal).toBe(2000);
    expect(out?.protein).toBe(120);
    expect(out?.carbs).toBe(0);
    expect(out?.fat).toBe(0);
  });
});
