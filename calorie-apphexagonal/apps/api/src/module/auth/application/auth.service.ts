import { UserRepository } from "../domain/UserRepository";
import { User } from "../domain/User";
import { PasswordHasher, TokenService } from "./ports/security";

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly newId: () => string
  ) {}

  async register(input: { email: string; password: string }) {
    const exists = await this.users.getByEmail(input.email);
    if (exists) throw Object.assign(new Error("EMAIL_TAKEN"), { code: "EMAIL_TAKEN" });

    const hash = await this.hasher.hash(input.password);
    const user = User.create({ id: this.newId(), email: input.email, passwordHash: hash });

    await this.users.create(user);
    const token = await this.tokens.sign({ sub: user.id, email: user.email });

    // Compat con tests: devolver también el user “público”
    return { token, user: { id: user.id, email: user.email } };
  }

  async login(input: { email: string; password: string }) {
    const user = await this.users.getByEmail(input.email);
    if (!user) throw Object.assign(new Error("INVALID_CREDENTIALS"), { code: "INVALID_CREDENTIALS" });

    const ok = await this.hasher.compare(input.password, user.passwordHash);
    if (!ok) throw Object.assign(new Error("INVALID_CREDENTIALS"), { code: "INVALID_CREDENTIALS" });

    const token = await this.tokens.sign({ sub: user.id, email: user.email });
    // Compat
    return { token, user: { id: user.id, email: user.email } };
  }
}