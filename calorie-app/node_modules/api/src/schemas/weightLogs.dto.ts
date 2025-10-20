import { z } from "zod";

// YYYY-MM-DD o ISO: validación blanda, se normaliza luego
const IsoOrDay = z.string().refine(
(s) => /^\d{4}-\d{2}-\d{2}(T.*Z)?$/.test(s),
"Fecha inválida (use YYYY-MM-DD o ISO)"
);

export const WeightLogsListQuerySchema = z.object({
from: IsoOrDay.optional(),
to: IsoOrDay.optional(),
});

export const CreateWeightLogSchema = z.object({
date: IsoOrDay.optional(), // si no viene, hoy
weightKg: z.number().positive("weightKg debe ser > 0"), // NO coerce
bodyFat: z.number().min(0).max(60).optional(), // opcional
});

export type WeightLogsListQueryDTO = z.infer<typeof WeightLogsListQuerySchema>;
export type CreateWeightLogDTO = z.infer<typeof CreateWeightLogSchema>;