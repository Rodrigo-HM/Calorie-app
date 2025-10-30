import type { UsersRepository } from "./ports/UserRepository";
import type { PasswordHasher, TokenService } from "./ports/security";
import type { StringValue } from "ms";

export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly jwtExpiresIn: StringValue | number
  ) {}

  async register(email: string, password: string) {
    const exists = await this.users.findByEmail(email);
    if (exists) {
      const err: any = new Error("EMAIL_TAKEN");
      err.code = "EMAIL_TAKEN";
      throw err;
    }
    const passwordHash = await this.hasher.hash(password);
    const user = await this.users.create({ email, passwordHash });
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      const err: any = new Error("INVALID_CREDENTIALS");
      err.code = "INVALID_CREDENTIALS";
      throw err;
    }
    const ok = await this.hasher.compare(password, user.passwordHash);
    if (!ok) {
      const err: any = new Error("INVALID_CREDENTIALS");
      err.code = "INVALID_CREDENTIALS";
      throw err;
    }
    const token = await this.tokens.sign(
      { sub: user.id, email: user.email },
      { expiresIn: this.jwtExpiresIn }
    );
    return { token, user: { id: user.id, email: user.email } };
  }
}