import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { TokenService } from "src/module/auth/application/ports/security";

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: Secret) {}

  sign(payload: Record<string, unknown>, opts?: { expiresIn?: string | number }): string {
    const options: SignOptions = {};
    if (opts?.expiresIn !== undefined) {
      // jsonwebtoken acepta string | number para expiresIn
      options.expiresIn = opts.expiresIn as any;
    }
    // Aseguramos los tipos esperados por la lib
    return jwt.sign(payload as object, this.secret, options);
  }

  verify<T = any>(token: string): T {
    return jwt.verify(token, this.secret) as T;
  }
}