import { userRepository } from "../repositories/impl/user-model.adapter";
import { BcryptHasher } from "../services/crypto/bcrypt-hasher";
import { JwtTokenService } from "../services/token/jwt-token.service";
import { AuthService } from "../services/auth.service";
import { config } from "../config/config";

export function buildAuthService() {
  const hasher = new BcryptHasher(10);
  const tokens = new JwtTokenService(config.jwtSecret);
  return new AuthService(userRepository, hasher, tokens, config.jwtExpiresIn);
}
//Cablea  las dependencias concretas de AuthService y las expone para ser usadas en los controladores