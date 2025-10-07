import { AuthService } from "../services/auth.service";
import { UserModelAdapter } from "../repositories/impl/user-model.adapter";
import { BcryptHasher } from "../services/crypto/bcrypt-hasher";
import { JwtTokenService } from "../services/token/jwt-token.service";
import { buildAuthMiddleware } from "../middlewares/auth";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

export function buildAuthService() {
const users = new UserModelAdapter();
const hasher = new BcryptHasher(10);
const tokens = new JwtTokenService(JWT_SECRET);
return new AuthService(users as any, hasher, tokens, JWT_EXPIRES_IN);
}

export function buildAuthMiddlewareInstance() {
const verifier = new JwtTokenService(JWT_SECRET);
return buildAuthMiddleware(verifier);
}