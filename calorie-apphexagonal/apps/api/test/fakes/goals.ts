import type {
  Goals,
  GoalsInput,
  GoalsRepository,
} from "../../src/module/goals/aplication/ports/GoalsRepository";

export function makeGoalsRepo(seed?: Goals[] | null): GoalsRepository {
  const list = Array.isArray(seed) ? seed : [];
  const store = new Map<string, Goals>(list.map((g) => [g.userId, g]));

  return {
    async get(userId: string): Promise<Goals | null> {
      return store.get(userId) ?? null;
    },
    async set(userId: string, g: GoalsInput): Promise<Goals> {
      const saved: Goals = { userId, ...g };
      store.set(userId, saved);
      return saved;
    },
  };
}