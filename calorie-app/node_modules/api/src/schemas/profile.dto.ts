import { z } from "zod";

export const ActivityEnum = z.enum(["sedentary", "light", "moderate", "active", "veryActive"]);
export const GoalKindEnum = z.enum(["cut", "maintain", "bulk"]);
export const SexEnum = z.enum(["male", "female"]);

export const ProfileUpsertSchema = z.object({
sex: SexEnum,
age: z.number().int().positive("age inválido"),
heightCm: z.number().int().positive("heightCm inválido"),
weightKg: z.number().positive("weightKg inválido"),
bodyFat: z.number().min(0, "bodyFat inválido").max(60, "bodyFat inválido").optional(),
activity: ActivityEnum,
goal: GoalKindEnum,
});

export type ProfileUpsertDTO = z.infer<typeof ProfileUpsertSchema>;