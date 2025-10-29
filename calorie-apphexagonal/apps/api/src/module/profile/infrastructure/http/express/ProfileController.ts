import { z } from "zod";
import { presentProfileAndGoals } from "../presenters";

// ✅ Esquema de validación con Zod
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
      run(userId: string, patch: any): Promise<any>;
    },
    private readonly recalcGoals: {
      run(userId: string, profile: any): Promise<any>;
    },
    private readonly profileRepo: {
      get(userId: string): Promise<any | null>;
    }
  ) {}

  // 🔹 GET /api/users/me/profile
  get = async (req: any, res: any) => {
    const userId = (req as any).user?.id ?? "u1";
    const profile = await this.profileRepo.get(userId);
    return res.json(profile ?? null);
  };

  // 🔹 PUT /api/users/me/profile
  update = async (req: any, res: any) => {
    const userId = (req as any).user?.id ?? "u1";

    // 🧾 Validar el cuerpo del request
    const patch = ProfilePatchSchema.parse(req.body ?? {});

    // 🧠 Caso de uso 1: Actualizar perfil
    const profile = await this.updateProfile.run(userId, patch);

    // ⚙️ Caso de uso 2: Recalcular y guardar objetivos
    const goals = await this.recalcGoals.run(userId, profile);

    // 🎨 Presentar el resultado (Profile + Goals formateados)
    return res.json(presentProfileAndGoals(profile, goals));
  };
}
