import { ProfileRepository, Profile } from "../repositories/profile.repository";
import { GoalsService } from "./goals.service";
import { calcGoalsFromProfile } from "./nutrition.service";

export class ProfileService {
constructor(
private readonly repo: ProfileRepository,
private readonly goals: GoalsService
) {}

get(userId: string): Promise<Profile | null> {
return this.repo.getByUser(userId);
}

async set(userId: string, data: {
sex: "male" | "female";
age: number;
heightCm: number;
weightKg: number;
bodyFat?: number;
activity: "sedentary" | "light" | "moderate" | "active" | "veryActive";
goal: "cut" | "maintain" | "bulk";
}): Promise<{ profile: Profile; goals: { kcal: number; calories: number; protein: number; carbs: number; fat: number } }> {
const profile = await this.repo.upsert(userId, data);

// calc → { calories, protein, carbs, fat }
const g0 = calcGoalsFromProfile(data);
const g = { kcal: g0.calories, protein: g0.protein, carbs: g0.carbs, fat: g0.fat };

// Guarda en Goals usando kcal
await this.goals.set(userId, g);

// Devolver ambas claves para compat con el front
return { profile, goals: { ...g, calories: g.kcal } };
}
}