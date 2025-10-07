import { AuthService } from "../services/auth.service";
import { UserModelAdapter } from "../repositories/impl/user-model.adapter";
import { BcryptHasher } from "../services/crypto/bcrypt-hasher";
import { JwtTokenService } from "../services/token/jwt-token.service";
import { buildAuthMiddleware } from "../middlewares/auth";
import { config } from "../config/config";

export function buildAuthService() {
const users = new UserModelAdapter();
const hasher = new BcryptHasher(10);
const tokens = new JwtTokenService(config.jwtSecret);
return new AuthService(users as any, hasher, tokens, config.jwtExpiresIn);
}

export function buildAuthMiddlewareInstance() {
const verifier = new JwtTokenService(config.jwtSecret);
return buildAuthMiddleware(verifier);
}