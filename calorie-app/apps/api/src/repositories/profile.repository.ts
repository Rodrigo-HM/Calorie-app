export interface Profile {
userId: string;
sex: "male" | "female";
age: number;
heightCm: number;
weightKg: number;
bodyFat?: number;
activity: "sedentary" | "light" | "moderate" | "active" | "veryActive";
goal: "cut" | "maintain" | "bulk";
updatedAt: string;
}

export interface ProfileRepository {
getByUser(userId: string): Promise<Profile | null>;
upsert(userId: string, data: Omit<Profile, "userId" | "updatedAt">): Promise<Profile>;
}