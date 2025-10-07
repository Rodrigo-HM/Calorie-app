import { z } from "zod";

export const GoalsUpsertSchema = z.object({
kcal: z.number().int().positive("kcal debe ser entero positivo"),
protein: z.number().min(0, "protein no puede ser negativa"),
carbs: z.number().min(0, "carbs no puede ser negativa"),
fat: z.number().min(0, "fat no puede ser negativa"),
});

export type GoalsUpsertDTO = z.infer<typeof GoalsUpsertSchema>;