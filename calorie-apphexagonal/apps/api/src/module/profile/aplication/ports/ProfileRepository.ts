export type Sex = "M" | "F" | "O";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "veryActive";
export type GoalKind = "cut" | "maintain" | "bulk";

export type Profile = {
  userId: string;
  name?: string;
  sex?: Sex;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  bodyFat?: number;             // %
  activity?: Activity;
  goal?: GoalKind;
  createdAt?: string;
  updatedAt?: string;
};

// Campos opcionales que puede traer el PATCH HTTP
export type ProfilePatch = Partial<{
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFat: number;
  activity: Activity;
  goal: GoalKind;
}>;

export interface ProfileRepository {
  get(userId: string): Promise<Profile | null>;
  update(userId: string, patch: ProfilePatch): Promise<Profile>;
}