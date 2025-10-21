import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenService, TokenVerifier } from './token.types';
import { config } from '../config/config';

/**
 * Servicio JWT que implementa TokenService y TokenVerifier.
 * Permite firmar y verificar tokens usando un secret configurable.
 */
export class JwtTokenService implements TokenService, TokenVerifier {
  private readonly secret: string;

  constructor(secret = config.jwtSecret) {
    if (!secret) {
      throw new Error('JWT secret no definido');
    }
    this.secret = secret;
  }

  /**
   * Firma un payload y devuelve un JWT.
   * @param payload Datos a firmar
   * @param options Opciones de jsonwebtoken
   */
  sign(payload: object, options?: SignOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload as any, this.secret, options ?? {}, (err, token) => {
        if (err || !token) return reject(err ?? new Error('SIGN_ERROR'));
        resolve(token);
      });
    });
  }

  /**
   * Verifica un token JWT y devuelve el payload tipado.
   * @throws Error si el token es inválido o expirado
   */
  verify<T = any>(token: string): T {
    return jwt.verify(token, this.secret) as T;
  }
}
