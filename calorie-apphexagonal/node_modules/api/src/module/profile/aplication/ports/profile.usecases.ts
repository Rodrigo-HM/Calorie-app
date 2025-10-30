import { Profile } from "./ProfileRepository";

export interface IUpdateProfile {
  run(userId: string, patch: unknown): Promise<Profile>;
  // si ya tienes tipos Profile/ProfilePatch, úsalos aquí
}

export interface IRecalculateAndSaveGoals {
  run(
    userId: string,
    profile: any
  ): Promise<{
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}
