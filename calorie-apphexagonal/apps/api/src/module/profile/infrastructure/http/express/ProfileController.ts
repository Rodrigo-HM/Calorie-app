export class ProfileController {
  constructor(
    private readonly profileRepo: {
      get: (userId: string) => Promise<any | null>;
      update: (userId: string, patch: any) => Promise<any>;
    },
    private readonly goalsRepo: {
      get: (userId: string) => Promise<any | null>;
    }
  ) {}

  // GET /api/users/me/profile
  get = async (req: any, res: any) => {
    const userId = (req as any).user?.id ?? 'u1';
    const p = await this.profileRepo.get(userId);
    return res.json(p ?? null);
  };

  // PUT /api/users/me/profile
  // El front suele esperar { profile, goals }
  update = async (req: any, res: any) => {
    const userId = (req as any).user?.id ?? 'u1';
    const patch = req.body ?? {};
    const profile = await this.profileRepo.update(userId, patch);
    const goals = await this.goalsRepo.get(userId);

    return res.json({
      profile,
      goals: goals ? { ...goals, calories: goals.kcal } : null,
    });
  };
}
