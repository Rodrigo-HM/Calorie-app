import type { Request, Response, NextFunction } from "express";
import { AuthService } from "src/module/auth/aplication/auth.service";
import { z } from "zod";

const CredsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = CredsSchema.parse(req.body ?? {});
      const result = await this.auth.login(email, password);
      return res.status(200).json(result);
    } catch (e: any) {
      if (e?.code === "INVALID_CREDENTIALS") {
        return res.status(401).json({ error: "INVALID_CREDENTIALS" });
      }
      return next(e);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = CredsSchema.parse(req.body ?? {});
      const user = await this.auth.register(email, password);
      return res.status(201).json(user);
    } catch (e: any) {
      if (e?.code === "EMAIL_TAKEN") {
        return res.status(409).json({ error: "EMAIL_TAKEN" });
      }
      return next(e);
    }
  };
}