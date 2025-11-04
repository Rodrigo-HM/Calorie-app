export interface TokenService {
  sign(payload: Record<string, unknown>, opts?: { expiresIn?: string | number }): string;
  verify<T = any>(token: string): T;
}