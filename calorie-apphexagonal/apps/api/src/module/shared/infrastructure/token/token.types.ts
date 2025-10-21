import type { SignOptions } from 'jsonwebtoken';

/**
 * Servicio para firmar tokens JWT.
 */
export interface TokenService {
  /**
   * Firma un payload y devuelve un JWT.
   * @param payload Datos a firmar
   * @param options Opciones de firma de jsonwebtoken
   */
  sign(payload: object, options?: SignOptions): Promise<string>;
}

/**
 * Servicio para verificar tokens JWT.
 */
export interface TokenVerifier {
  /**
   * Verifica un token JWT y devuelve el payload tipado.
   * @throws Error si el token es inválido o expirado
   */
  verify<T = any>(token: string): T;
}
