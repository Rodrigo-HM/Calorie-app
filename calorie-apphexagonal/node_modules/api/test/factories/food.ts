export type Food = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function makeFood(over: Partial<Food> = {}): Food {
  return {
    id: over.id ?? "food_" + Math.random().toString(36).slice(2, 8),
    name: over.name ?? "Food " + Math.random().toString(36).slice(2, 5),
    kcal: over.kcal ?? 100,
    protein: over.protein ?? 10,
    carbs: over.carbs ?? 10,
    fat: over.fat ?? 5,
  };
}
