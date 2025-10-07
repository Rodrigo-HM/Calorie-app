import jwt from "jsonwebtoken";
import { TokenService, TokenVerifier } from "./token.types";

export class JwtTokenService implements TokenService, TokenVerifier {
constructor(private readonly secret: string) {}

sign(payload: object, options?: jwt.SignOptions): Promise<string> {
const token = jwt.sign(payload as any, this.secret, options);
return Promise.resolve(token);
}

verify<T = any>(token: string): T {
return jwt.verify(token, this.secret) as T;
}
}