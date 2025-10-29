import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { GoalsService } from "../../../aplication/GoalsService";
import { presentGoals } from "../presenters";
import { parse } from "src/module/shared/infrastructure/http/parse";

// Esquema HTTP: aceptamos tanto "kcal" como "calories" y macros opcionales
const GoalsBodySchema = z.object({
  kcal: z.number().int().nonnegative().optional(),
  calories: z.number().int().nonnegative().optional(),
  protein: z.number().int().nonnegative().optional(),
  carbs: z.number().int().nonnegative().optional(),
  fat: z.number().int().nonnegative().optional(),
});

export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  // GET /api/users/me/goals
  get = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id ?? "u1";
    const g = await this.goals.get(userId);

    // Presenter: añade alias "calories"
    return res.json(presentGoals(g));
  };

  // PUT /api/users/me/goals
  set = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id ?? "u1";

      // Validación en el borde HTTP
      const body = parse(GoalsBodySchema, req.body ?? {});

      // Normalización: priorizamos kcal; si no viene, usamos calories
      const normalized = {
        kcal: body.kcal ?? body.calories ?? 0,
        protein: body.protein ?? 0,
        carbs: body.carbs ?? 0,
        fat: body.fat ?? 0,
      };

      // Reglas de negocio en el servicio
      const saved = await this.goals.set(userId, normalized);

      // Presenter para compatibilidad (alias)
      return res.json(presentGoals(saved));
    } catch (e) {
      return next(e);
    }
  };
}
