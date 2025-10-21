import { buildAuthMiddleware } from '../http/express/middlewares/auth';
import { JwtTokenService } from '../token/jwt-token.service';

/**
 * Crea una instancia del middleware de autenticación
 * usando JwtTokenService con el secret definido en config.
 */
export function buildAuthMiddlewareInstance() {
  const verifier = new JwtTokenService(); // usa config.jwtSecret por defecto
  return buildAuthMiddleware(verifier);
}
