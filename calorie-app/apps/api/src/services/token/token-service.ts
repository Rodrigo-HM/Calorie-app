export interface TokenService {
  sign(payload: object, options?: { expiresIn?: string | number }): Promise<string>;
}
