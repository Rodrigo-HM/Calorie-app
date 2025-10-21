import { AuthService } from "../../../../auth/services/auth.service";

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  login = async (req: any, res: any, next: any) => {
    try {
      const { email, password } = req.body ?? {};
      const result = await this.auth.login(email, password);
      return res.status(200).json(result);
    } catch (e: any) {
      if (e?.code === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
      }
      return next(e);
    }
  };

  register = async (req: any, res: any, next: any) => {
    try {
      const { email, password } = req.body ?? {};
      const user = await this.auth.register(email, password);
      return res.status(201).json(user);
    } catch (e: any) {
      if (e?.code === 'EMAIL_TAKEN') {
        return res.status(409).json({ error: 'EMAIL_TAKEN' });
      }
      return next(e);
    }
  };
}
