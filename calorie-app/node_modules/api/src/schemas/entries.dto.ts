import { z } from "zod";

// YYYY-MM-DD
export const DayString = z
.string()
.regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)");

export const EntriesListQuerySchema = z.object({
date: DayString.optional(), // si no viene, usarás la fecha actual en el controller
});

export const CreateEntrySchema = z.object({
foodId: z.string().min(1, "foodId requerido"),
grams: z.number().int().positive("grams debe ser entero positivo"),
// permitimos ISO completa opcionalmente
date: z.string().datetime().optional(), // ISO-8601 válida si viene
});

export const UpdateEntrySchema = z.object({
grams: z.number().int().positive("grams debe ser entero positivo"),
});

export const EntryIdParamsSchema = z.object({
id: z.string().min(1), // mantenemos cualquier string; el 404 lo decide tu modelo
});

export type EntriesListQueryDTO = z.infer<typeof EntriesListQuerySchema>;
export type CreateEntryDTO = z.infer<typeof CreateEntrySchema>;
export type UpdateEntryDTO = z.infer<typeof UpdateEntrySchema>;
export type EntryIdParamsDTO = z.infer<typeof EntryIdParamsSchema>;