import { Request, Response, RequestHandler } from "express";
import { GoalsUpsertSchema } from "../schemas/goals.dto";
import { buildGoalsService } from "../composition/goals.composition";

const service = buildGoalsService();

type AuthedRequest = Request & {
user: { id: string; sub?: string; email?: string };
};

export const GoalsController: {
get: RequestHandler;
set: RequestHandler;
} = {
get: async (req, res) => {
const userId = (req as AuthedRequest).user.id;
const goals = await service.get(userId);
// contrato actual: devolver null si no hay metas
return res.status(200).json(goals ?? null);
},

set: async (req, res) => {
const parsed = GoalsUpsertSchema.safeParse(req.body);
if (!parsed.success) {
return res
.status(400)
.json({ error: "Datos inválidos", errors: parsed.error.flatten() });
}
const userId = (req as AuthedRequest).user.id;
try {
const saved = await service.set(userId, parsed.data);
return res.status(200).json(saved);
} catch (e: any) {
return res.status(500).json({ error: "Error guardando metas" });
}
},
};