// src/module/goals/application/GoalsService.ts
import type { GoalsRepository } from "../domain/GoalsRepository";
import { ensureGoals, type Goals, type GoalsInput } from "../domain/Goals";

// Aceptamos alias "calories" además de "kcal"
type GoalsSetInput = GoalsInput & { calories?: number };

// Compat con tests: respuestas incluyen userId
type GoalsSaved = Goals & { userId: string };

export class GoalsService {
  constructor(private readonly repo: GoalsRepository) {}

  // Incluye userId para compat (cast a any para no romper tipos río arriba)
  async get(userId: string): Promise<Goals | null> {
    const g = await this.repo.get(userId);
    return g ? ({ ...g, userId } as any) : null;
  }

  async set(userId: string, input: GoalsSetInput): Promise<GoalsSaved> {
    // Normaliza calories → kcal y aplica defaults 0
    const normalized = ensureGoals({
      kcal: input.kcal ?? input.calories,
      protein: input.protein,
      carbs: input.carbs,
      fat: input.fat,
    });

    const saved = await this.repo.set(userId, normalized);
    // Compat: devolver también userId
    return { ...saved, userId };
  }
}