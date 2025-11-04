import { User } from "../domain/User";
import type { UserRepository } from "../domain/UserRepository";
import type { Hasher } from "../domain/security/Hasher";
import type { TokenService } from "../domain/security/TokenService";

type AuthResult = { user: { id: string; email: string }; accessToken: string };

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: Hasher,
    private readonly tokens: TokenService,
    private readonly idGen: () => string
  ) {}

  async register(input: { email: string; password: string }): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw Object.assign(new Error("EMAIL_INVALID"), { code: "EMAIL_INVALID" });
    }
    if (!input.password || input.password.length < 6) {
      throw Object.assign(new Error("PASSWORD_INVALID"), { code: "PASSWORD_INVALID" });
    }

    const existing = await this.users.findByEmail(email);
    if (existing) throw Object.assign(new Error("EMAIL_TAKEN"), { code: "EMAIL_TAKEN" });

    const id = this.idGen();
    const passwordHash = await this.hasher.hash(input.password);

    const user = User.create({ id, email, passwordHash }); // crea con createdAt
    await this.users.create(user);

    const accessToken = this.tokens.sign({ sub: user.id, email: user.email });
    return { user: { id: user.id, email: user.email }, accessToken };
  }

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user) throw Object.assign(new Error("INVALID_CREDENTIALS"), { code: "INVALID_CREDENTIALS" });

    const ok = await this.hasher.compare(input.password, user.passwordHash);
    if (!ok) throw Object.assign(new Error("INVALID_CREDENTIALS"), { code: "INVALID_CREDENTIALS" });

    const accessToken = this.tokens.sign({ sub: user.id, email: user.email });
    return { user: { id: user.id, email: user.email }, accessToken };
  }
}