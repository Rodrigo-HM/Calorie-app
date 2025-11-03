import type { Request, Response } from "express";
import { z } from "zod";
import { GoalsService } from "../../../application/GoalsService";
import { presentGoals } from "../presenters";

// Acepta payloads legacy (calories) o modernos (kcal)
const GoalsSchema = z.object({
  kcal: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  // compat: calories como alias de kcal
  calories: z.number().min(0).optional(),
});

export class GoalsController {
  constructor(private readonly service: GoalsService) {}

  get = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id ?? "u1";
    const goals = await this.service.get(userId);
    return res.json(presentGoals(goals));
  };

  set = async (req: Request, res: Response) => {
    const body = GoalsSchema.parse(req.body ?? {});
    const userId = (req as any).user?.id ?? "u1";
    // Normaliza calories → kcal
    const input = {
      kcal: body.kcal ?? body.calories,
      protein: body.protein,
      carbs: body.carbs,
      fat: body.fat,
    };
    const saved = await this.service.set(userId, input);
    return res.json(presentGoals(saved));
  };
}