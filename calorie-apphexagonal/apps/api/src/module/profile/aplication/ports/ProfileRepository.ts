export type Profile = {
  userId: string;
  name?: string;
  age?: number;
  sex?: "M" | "F" | "O";
  heightCm?: number;
  weightKg?: number;
  bodyFat?: number;
  activity?: "sedentary" | "light" | "moderate" | "active" | "veryActive";
  goal?: "cut" | "maintain" | "bulk";
};

export interface ProfileRepository {
  get(userId: string): Promise<Profile | null>;
  update(
    userId: string,
    patch: Partial<Omit<Profile, 'userId'>>
  ): Promise<Profile>;
}
