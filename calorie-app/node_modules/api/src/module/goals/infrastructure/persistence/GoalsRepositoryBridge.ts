// apps/api/src/module/goals/infrastructure/persistence/GoalsRepositoryBridge.ts

import { GoalsAdapter } from "src/repositories/impl/goals.adapter";

// ✅ Ajusta esta importación a la ruta real de tu adapter legacy:

export type GoalsShape = {
  userId: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  updatedAt?: string;
};

/**
 * GoalsRepositoryBridge
 * ---------------------
 * Puente entre el dominio moderno y el adapter legacy de metas.
 * Se apoya en los métodos `getByUserId()` y `upsert()` del adapter.
 */
export class GoalsRepositoryBridge {
  constructor(private readonly legacy: GoalsAdapter) {}

  /**
   * Obtiene las metas de un usuario.
   * Devuelve `null` si no existen.
   */
  async get(userId: string): Promise<GoalsShape | null> {
    if (!this.legacy.getByUserId) {
      throw new Error('GoalsAdapter debe implementar getByUserId(userId)');
    }

    const g = await this.legacy.getByUserId(userId);
    if (!g) return null;

    // Asegura que los valores son numéricos
    return {
      userId: g.userId,
      kcal: Number(g.kcal),
      protein: Number(g.protein),
      carbs: Number(g.carbs),
      fat: Number(g.fat),
      updatedAt: g.updatedAt ?? undefined,
    };
  }

  /**
   * Crea o actualiza las metas de un usuario.
   */
  async set(
    userId: string,
    data: Omit<GoalsShape, 'userId' | 'updatedAt'>
  ): Promise<GoalsShape> {
    if (!this.legacy.upsert) {
      throw new Error('GoalsAdapter debe implementar upsert(userId, data)');
    }

    const saved = await this.legacy.upsert(userId, data);

    return {
      userId: saved.userId ?? userId,
      kcal: Number(saved.kcal),
      protein: Number(saved.protein),
      carbs: Number(saved.carbs),
      fat: Number(saved.fat),
      updatedAt: saved.updatedAt ?? new Date().toISOString(),
    };
  }
}
