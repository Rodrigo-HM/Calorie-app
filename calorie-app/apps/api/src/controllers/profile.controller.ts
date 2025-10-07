import { Request, Response, RequestHandler } from "express";
import { buildProfileService } from "../composition/profile.composition";
import { ProfileUpsertSchema } from "../schemas/profile.dto";

const service = buildProfileService();

type AuthedRequest = Request & {
user: { id: string; sub?: string; email?: string };
};

export const ProfileController: {
get: RequestHandler;
put: RequestHandler;
} = {
get: async (req, res) => {
const userId = (req as AuthedRequest).user.id;
const p = await service.get(userId);
return res.json(p ?? null);
},

put: async (req, res) => {
const parsed = ProfileUpsertSchema.safeParse(req.body);
if (!parsed.success) {
return res
.status(400)
.json({ error: "Datos inválidos", errors: parsed.error.flatten() });
}
const userId = (req as AuthedRequest).user.id;
try {
const out = await service.set(userId, parsed.data);
return res.status(200).json(out);
} catch (e: any) {
return res.status(500).json({ error: "Error guardando perfil" });
}
},
};