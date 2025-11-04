import type { Request, Response } from "express";
import { z } from "zod";
import { presentProfileAndGoals } from "../presenters";
import { parse } from "src/module/shared/infrastructure/http/parse";
import type { ProfilePatch, Profile } from "src/module/profile/domain/ProfileRepository";
import type { Goals } from "src/module/goals/domain/GoalsRepository";
import type { UpdateProfile } from "../../../application/UpdateProfile";
import type { RecalculateAndSaveGoals } from "../../../application/RecalculateAndSaveGoals";


const ProfilePatchSchema = z.object({
  name: z.string().min(1).optional(),
  sex: z.enum(["M", "F", "O"]).optional(),
  age: z.number().int().min(0).max(120).optional(),
  heightCm: z.number().positive().max(300).optional(),
  weightKg: z.number().positive().max(500).optional(),
  bodyFat: z.number().min(0).max(60).optional(),
  activity: z.enum(["sedentary", "light", "moderate", "active", "veryActive"]).optional(),
  goal: z.enum(["cut", "maintain", "bulk"]).optional(),
}).partial();

export class ProfileController {
  constructor(
    private readonly updateProfile: UpdateProfile,
    private readonly recalcGoals: RecalculateAndSaveGoals,
    private readonly profileRepo: { get(userId: string): Promise<Profile | null> }
  ) {}

  get = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id ?? "u1";
    const profile = await this.profileRepo.get(userId);
    return res.json(profile ?? null);
  };

  update = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id ?? "u1";
    const patch = parse(ProfilePatchSchema, req.body ?? {}) as z.infer<typeof ProfilePatchSchema>; // o ProfilePatch
    const profile = await this.updateProfile.run(userId, patch as ProfilePatch);
    const goals: Goals = await this.recalcGoals.run(userId, profile);
    return res.json(presentProfileAndGoals(profile, goals));
  };
}