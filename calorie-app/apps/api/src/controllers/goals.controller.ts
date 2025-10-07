import { Request, RequestHandler } from "express";
import { z } from "zod";
import { buildGoalsService } from "../composition/goals.composition";

const service = buildGoalsService();

type AuthedRequest = Request & { user: { id: string; sub?: string; email?: string } };

// Schemas compatibles: legacy (calories) y moderno (kcal)
const LegacySchema = z.object({
calories: z.number().int().positive(),
protein: z.number().int().min(0).optional(),
carbs: z.number().int().min(0).optional(),
fat: z.number().int().min(0).optional(),
});

const ModernSchema = z.object({
kcal: z.number().int().positive(),
protein: z.number().int().min(0).optional(),
carbs: z.number().int().min(0).optional(),
fat: z.number().int().min(0).optional(),
});

export const GoalsController: { get: RequestHandler; set: RequestHandler } = {
get: async (req, res) => {
const userId = (req as AuthedRequest).user.id;
const goals = await service.get(userId);
// compat: incluir "calories" como alias de "kcal"
return res.status(200).json(goals ? { ...goals, calories: goals.kcal } : null);
},

set: async (req, res) => {
const parsedLegacy = LegacySchema.safeParse(req.body);
const parsedModern = ModernSchema.safeParse(req.body);

if (!parsedLegacy.success && !parsedModern.success) {
  const err = (parsedModern.error ?? parsedLegacy.error)!;
  return res.status(400).json({ error: "Datos inválidos", errors: err.flatten() });
}

let normalized: { kcal: number; protein: number; carbs: number; fat: number };

if (parsedLegacy.success) {
  normalized = {
    kcal: parsedLegacy.data.calories,
    protein: parsedLegacy.data.protein ?? 0,
    carbs: parsedLegacy.data.carbs ?? 0,
    fat: parsedLegacy.data.fat ?? 0,
  };
} else if (parsedModern.success) {
  normalized = {
    kcal: parsedModern.data.kcal,
    protein: parsedModern.data.protein ?? 0,
    carbs: parsedModern.data.carbs ?? 0,
    fat: parsedModern.data.fat ?? 0,
  };
} else {
  // TS safeguard (no alcanzable por el return anterior)
  return res.status(400).json({ error: "Datos inválidos" });
}

const userId = (req as AuthedRequest).user.id;
try {
  const saved = await service.set(userId, normalized);
  // compat: añade "calories" en la respuesta
  return res.status(200).json({ ...saved, calories: saved.kcal });
} catch {
  return res.status(500).json({ error: "Error guardando metas" });
}
},
};