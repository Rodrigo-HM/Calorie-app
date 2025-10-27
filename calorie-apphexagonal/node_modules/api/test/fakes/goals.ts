import type { Goals, GoalsRepository } from "../../src/module/goals/aplication/ports/GoalsRepository";

export function makeGoalsRepo(initial: Goals | null = null): GoalsRepository {
  let store = initial;

  return {
    async get(userId: string) {
      return store && store.userId === userId ? store : null;
    },

    async set(userId: string, g: Omit<Goals, "userId">) {
      store = { userId, ...g };
      return store;
    },
  };
}
