import { z } from "zod";
import { GoalsService } from "../../../aplication/GoalsService";

const schema = z.object({
  calories: z.number().nonnegative().optional(),
  kcal: z.number().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
});

export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  get = async (req: any, res: any) => {
    const userId = req.user?.id ?? "u1";
    const g = await this.goals.get(userId);
    return res.json(g ? { ...g, calories: g.kcal } : null);
  };

  set = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id ?? "u1";
      const body = schema.parse(req.body);
      const saved = await this.goals.set(userId, body);
      return res.json({ ...saved, calories: saved.kcal });
    } catch (e) {
      return next(e);
    }
  };
}
