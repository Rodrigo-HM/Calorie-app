export type Goals = {
  userId: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function makeGoals(over: Partial<Goals> = {}): Goals {
  return {
    userId: over.userId ?? "u1",
    kcal: over.kcal ?? 2000,
    protein: over.protein ?? 120,
    carbs: over.carbs ?? 200,
    fat: over.fat ?? 70,
  };
}
