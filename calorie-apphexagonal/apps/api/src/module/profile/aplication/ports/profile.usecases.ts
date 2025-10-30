import type { Profile, ProfilePatch } from "./ProfileRepository";
import type { Goals } from "src/module/goals/aplication/ports/GoalsRepository";

export interface IUpdateProfile {
  run(userId: string, patch: ProfilePatch): Promise<Profile>;
}

// Caso de uso: recalcular y guardar metas, retorna Goals
export interface IRecalculateAndSaveGoals {
  run(userId: string, profile: Profile): Promise<Goals>;
}