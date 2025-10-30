import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";
import type { TokenService } from "src/module/auth/aplication/ports/security";
import { config } from "../config/config";

export class JwtTokenService implements TokenService {
  private readonly secret: Secret;

  constructor(secret?: string) {
    // Aseguramos que la secret sea string (no null/undefined)
    const s = secret ?? config.jwtSecret;
    if (!s || typeof s !== "string") {
      throw new Error("JWT secret must be a non-empty string");
    }
    this.secret = s as Secret;
  }

  sign(
    payload: Record<string, unknown>,
    opts?: { expiresIn?: StringValue | number }
  ): string {
    const options: SignOptions = {};
    if (opts?.expiresIn !== undefined) {
      options.expiresIn = opts.expiresIn; // <- StringValue | number
    }
    return jwt.sign(payload, this.secret, options);
  }

  verify<T = any>(token: string): T {
    return jwt.verify(token, this.secret) as T;
  }
}