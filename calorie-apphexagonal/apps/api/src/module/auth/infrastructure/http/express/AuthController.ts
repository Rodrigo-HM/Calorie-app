import { Request, Response } from "express";
import { AuthService } from "../../../application/auth.service";

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    const result = await this.auth.login({ email, password }); // ← objeto
    // result: { token, user }
    return res.status(200).json(result);
  };

  register = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    const result = await this.auth.register({ email, password }); // ← objeto
    // result: { token, user }
    return res.status(201).json(result);
  };
}