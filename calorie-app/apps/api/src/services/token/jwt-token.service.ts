// apps/api/src/services/token/jwt-token.service.ts
import jwt, { SignOptions, Secret, JwtPayload } from "jsonwebtoken";
import { TokenService } from "./token-service";

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: Secret) {}

  sign(payload: Record<string, unknown>, options?: { expiresIn?: string | number }): Promise<string> {
    const signOptions: SignOptions = {};
    if (options?.expiresIn !== undefined) {
      // jsonwebtoken acepta string | number; el type guard evita la ambigüedad del overload
      signOptions.expiresIn = options.expiresIn as any;
    }

    return new Promise<string>((resolve, reject) => {
      jwt.sign(payload, this.secret, signOptions, (err, token) => {
        if (err || !token) return reject(err ?? new Error("Token generation failed"));
        resolve(token);
      });
    });
  }
}
