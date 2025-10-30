import type { Request, Response } from "express";
import { z } from "zod";
import { presentProfileAndGoals } from "../presenters";
import { parse } from "src/module/shared/infrastructure/http/parse";
import type { Goals } from "src/module/goals/aplication/ports/GoalsRepository";

// Esquema de validación del PATCH de perfil (todos los campos opcionales)
const ProfilePatchSchema = z
  .object({
    name: z.string().min(1).optional(),
    sex: z.enum(["M", "F", "O"]).optional(),
    age: z.number().int().min(0).max(120).optional(),
    heightCm: z.number().positive().max(300).optional(),
    weightKg: z.number().positive().max(500).optional(),
    bodyFat: z.number().min(0).max(60).optional(),
    activity: z
      .enum(["sedentary", "light", "moderate", "active", "veryActive"])
      .optional(),
    goal: z.enum(["cut", "maintain", "bulk"]).optional(),
  })
  .partial();

export class ProfileController {
  constructor(
    private readonly updateProfile: {
      run(userId: string, patch: unknown): Promise<any>;
    },
    private readonly recalcGoals: {
      // IMPORTANTE: el caso de uso devuelve Goals (incluye userId)
      run(userId: string, profile: any): Promise<Goals>;
    },
    private readonly profileRepo: {
      get(userId: string): Promise<any | null>;
    }
  ) {}

  // GET /api/users/me/profile
  get = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id ?? "u1";
    const profile = await this.profileRepo.get(userId);
    return res.json(profile ?? null);
  };

  // PUT /api/users/me/profile
  update = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id ?? "u1";

    // 1) Validación en el borde HTTP
    const patch = parse(ProfilePatchSchema, req.body ?? {});

    // 2) Caso de uso: actualizar perfil
    const profile = await this.updateProfile.run(userId, patch);

    // 3) Caso de uso: recalcular y guardar objetivos
    const goals = await this.recalcGoals.run(userId, profile);

    // 4) Presentación: alias calories en goals
    return res.json(presentProfileAndGoals(profile, goals));
  };
}
