import { GoalsRepository } from "../aplication/ports/GoalsRepository";

export class GoalsService {
  constructor(private readonly repo: GoalsRepository) {}

  async get(userId: string) {
    return this.repo.get(userId);
  }

  async set(
    userId: string,
    dto: { kcal?: number; calories?: number; protein?: number; carbs?: number; fat?: number }
  ) {
    const normalized = {
      kcal: dto.kcal ?? dto.calories ?? 0,
      protein: dto.protein ?? 0,
      carbs: dto.carbs ?? 0,
      fat: dto.fat ?? 0,
    };
    return this.repo.set(userId, normalized);
  }
}
