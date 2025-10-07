import { Request, Response } from "express";
import { buildAuthService } from "../composition/auth.composition"; // OJO: con llaves
import { AuthSchema } from "../schemas/auth.dto";

const authService = buildAuthService();

export const AuthController = {
async register(req: Request, res: Response) {
const parsed = AuthSchema.safeParse(req.body);
if (!parsed.success) {
return res.status(400).json({ error: "Datos inválidos", errors: parsed.error.flatten() });
}
const { email, password } = parsed.data;
try {
const user = await authService.register(email, password);
return res.status(201).json(user);
} catch (e: any) {
if (e?.code === "EMAIL_TAKEN") return res.status(409).json({ error: "Email ya registrado" });
return res.status(500).json({ error: "Error registrando usuario" });
}
},

async login(req: Request, res: Response) {
const parsed = AuthSchema.safeParse(req.body);
if (!parsed.success) {
return res.status(400).json({ error: "Datos inválidos", errors: parsed.error.flatten() });
}
const { email, password } = parsed.data;
try {
const result = await authService.login(email, password);
return res.status(200).json(result);
} catch (e: any) {
if (e?.code === "INVALID_CREDENTIALS") return res.status(401).json({ error: "Credenciales inválidas" });
return res.status(500).json({ error: "Error iniciando sesión" });
}
},
};