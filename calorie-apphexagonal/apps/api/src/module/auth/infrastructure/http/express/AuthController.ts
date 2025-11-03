import type { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../../../application/auth.service";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  register = async (req: Request, res: Response) => {
    const { email, password } = RegisterSchema.parse(req.body ?? {});
    const out = await this.auth.register({ email, password });
    // 201 Created
    return res.status(201).json(out);
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = LoginSchema.parse(req.body ?? {});
    const out = await this.auth.login({ email, password });
    return res.json(out);
  };
}