import type { GoalsRepository } from "src/module/goals/domain/GoalsRepository";
import { ensureGoals, type Goals } from "src/module/goals/domain/Goals";

// Semilla: metas por usuario (Partial<Goals> por comodidad)
export type Seed = { userId: string } & Partial<Goals>;

export function makeGoalsRepo(seed?: Seed[] | null): GoalsRepository {
  const items = Array.isArray(seed) ? seed : [];

  // Mapa userId -> Goals (sin userId dentro del objeto)
  const store = new Map<string, Goals>();
  items.forEach((s) => {
    store.set(s.userId, ensureGoals(s));
  });

  return {
    async get(userId: string): Promise<Goals | null> {
      return store.get(userId) ?? null;
    },
    async set(userId: string, data: Goals): Promise<Goals> {
      store.set(userId, data);
      return data;
    },
  };
}