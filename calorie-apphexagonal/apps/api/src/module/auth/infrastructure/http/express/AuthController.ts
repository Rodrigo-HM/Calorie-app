import { AuthService } from "src/module/auth/services/auth.service";

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  login = async (req: any, res: any) => {
    const { email, password } = req.body ?? {};
    const result = await this.auth.login(email, password);
    return res.status(200).json(result);
  };

  register = async (req: any, res: any) => {
    const { email, password } = req.body ?? {};
    const user = await this.auth.register(email, password);
    return res.status(201).json(user);
  };
}
