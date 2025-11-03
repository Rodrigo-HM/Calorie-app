import jwt, { type SignOptions } from "jsonwebtoken";
import type { TokenService } from "src/module/auth/application/ports/security";
import { config } from "../config/config";

export class JwtTokenService implements TokenService {
  private readonly secret: string;
  private readonly defaultExpiresIn: string | number;

  constructor(secret = config.jwtSecret, defaultExpiresIn: string | number = "2h") {
    if (!secret || typeof secret !== "string") {
      throw new Error("JWT secret must be a non-empty string");
    }
    this.secret = secret;
    this.defaultExpiresIn = defaultExpiresIn;
  }

  async sign(
    payload: Record<string, unknown>,
    opts?: { expiresIn?: string | number }
  ): Promise<string> {
    const expiresIn = (opts?.expiresIn ?? this.defaultExpiresIn) as SignOptions["expiresIn"];
    const token = jwt.sign(payload, this.secret, { expiresIn });
    return Promise.resolve(token);
  }

  async verify<T = unknown>(token: string): Promise<T> {
    const decoded = jwt.verify(token, this.secret) as T;
    return Promise.resolve(decoded);
  }
}