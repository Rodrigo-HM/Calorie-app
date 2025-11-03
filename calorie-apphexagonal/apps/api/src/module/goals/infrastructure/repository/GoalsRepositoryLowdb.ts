import { db } from "../../../shared/infrastructure/db/database";
import type { GoalsRepository } from "../../domain/GoalsRepository";
import type { Goals } from "../../domain/Goals";

export class GoalsRepositoryLowdb implements GoalsRepository {
  async get(userId: string): Promise<Goals | null> {
    db.read();
    const row = (db.data!.goals as any[]).find((g) => g.userId === userId) ?? null;
    if (!row) return null;
    return {
      kcal: row.kcal ?? row.calories ?? 0,
      protein: row.protein ?? 0,
      carbs: row.carbs ?? 0,
      fat: row.fat ?? 0,
    };
  }

  async set(userId: string, data: Goals): Promise<Goals> {
    db.read();
    const goals = (db.data!.goals as any[]);
    const idx = goals.findIndex((g) => g.userId === userId);
    const row = { userId, ...data };
    if (idx === -1) goals.push(row);
    else goals[idx] = row;
    db.write();
    return data;
  }
}