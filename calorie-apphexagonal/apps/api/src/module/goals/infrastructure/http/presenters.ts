export type GoalsDTO = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function presentGoals(goals: GoalsDTO | null) {
  if (!goals) return null;
  return { ...goals, calories: goals.kcal };
}
