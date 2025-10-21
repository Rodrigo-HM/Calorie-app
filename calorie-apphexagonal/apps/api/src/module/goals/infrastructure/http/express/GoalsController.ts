import { z } from 'zod';

const schema = z.object({
  calories: z.number().nonnegative().optional(),
  kcal: z.number().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
});

export class GoalsController {
  constructor(
    private readonly goalsRepo: {
      get: (userId: string) => Promise<any | null>;
      set: (userId: string, g: { kcal: number; protein: number; carbs: number; fat: number }) => Promise<any>;
    }
  ) {}

  // GET /api/users/me/goals
  get = async (req: any, res: any) => {
    const userId = req.user?.id ?? 'u1';
    const g = await this.goalsRepo.get(userId);
    return res.json(g ? { ...g, calories: g.kcal } : null);
  };

  // PUT /api/users/me/goals
  set = async (req: any, res: any) => {
    const userId = req.user?.id ?? 'u1';
    const b = schema.parse(req.body);
    const normalized = {
      kcal: b.kcal ?? b.calories ?? 0,
      protein: b.protein ?? 0,
      carbs: b.carbs ?? 0,
      fat: b.fat ?? 0,
    };
    const saved = await this.goalsRepo.set(userId, normalized);
    return res.json({ ...saved, calories: saved.kcal });
  };
}
