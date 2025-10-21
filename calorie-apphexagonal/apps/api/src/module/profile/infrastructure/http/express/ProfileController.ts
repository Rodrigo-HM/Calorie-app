import { GoalsRepository } from 'src/module/goals/infrastructure/repository/GoalsRepository';
import { calculateGoals } from 'src/module/profile/domain/GoalsCalculator';

export class ProfileController {
  constructor(
    private readonly profileRepo: {
      get: (userId: string) => Promise<any | null>;
      update: (userId: string, patch: any) => Promise<any>;
    },
    private readonly goalsRepo: GoalsRepository
  ) {}

  // GET /api/users/me/profile
  get = async (req: any, res: any) => {
    const userId = (req as any).user?.id ?? 'u1';
    const p = await this.profileRepo.get(userId);
    return res.json(p ?? null);
  };

  // PUT /api/users/me/profile
  update = async (req: any, res: any) => {
    const userId = (req as any).user?.id ?? 'u1';

    // 1) Guarda el perfil
    const profile = await this.profileRepo.update(userId, req.body ?? {});

    // 2) Calcula metas
    const goalsCalc = calculateGoals({
      sex: profile.sex,           // "M" | "F"
      age: profile.age,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      bodyFat: profile.bodyFat,   // opcional
      activity: profile.activity, // "sedentary" | "light" | "moderate" | "active" | "veryActive"
      goal: profile.goal,         // "cut" | "maintain" | "bulk"
    });

    // 3) Persiste metas
    await this.goalsRepo.set(userId, goalsCalc);

    // 4) Devuelve { profile, goals } con alias calories para compatibilidad
    return res.json({
      profile,
      goals: { ...goalsCalc, calories: goalsCalc.kcal },
    });
  };
}
