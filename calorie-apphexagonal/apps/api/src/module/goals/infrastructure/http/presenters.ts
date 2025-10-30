import type { Goals } from "src/module/goals/aplication/ports/GoalsRepository";

export type GoalsView = Omit<Goals, "userId"> & { calories: number };

export function presentGoals(goals: Goals | null) {
  if (!goals) return null;
  const { userId: _ignore, ...rest } = goals;
  return { ...rest, calories: goals.kcal } as GoalsView;
}