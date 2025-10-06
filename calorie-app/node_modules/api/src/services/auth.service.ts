import { UserRepository } from "../repositories/user.repository";
import { PasswordHasher } from "./crypto/password-hasher";
import { TokenService } from "./token/token-service";

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly jwtExpiresIn: string | number
  ) {}

  async register(email: string, password: string) {
    const exists = await this.users.getByEmail(email);
    if (exists) throw Object.assign(new Error("EMAIL_TAKEN"), { code: "EMAIL_TAKEN" });
    const passwordHash = await this.hasher.hash(password);
    const user = await this.users.create(email, passwordHash);
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.users.getByEmail(email);
    if (!user) throw Object.assign(new Error("INVALID_CREDENTIALS"), { code: "INVALID_CREDENTIALS" });
    const ok = await this.hasher.compare(password, user.passwordHash);
    if (!ok) throw Object.assign(new Error("INVALID_CREDENTIALS"), { code: "INVALID_CREDENTIALS" });
    const token = await this.tokens.sign({ sub: user.id, email: user.email }, { expiresIn: this.jwtExpiresIn });
    return { token, user: { id: user.id, email: user.email } };
  }
}
