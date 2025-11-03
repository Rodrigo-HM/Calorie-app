import type { Goals } from "../../domain/GoalsRepository";

export type GoalsView = Goals & { calories: number };

export function presentGoals(g: Goals | null): GoalsView | null {
  if (!g) return null;
  return { ...g, calories: g.kcal };
}