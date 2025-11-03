export interface Hasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

export interface TokenService {
  sign(payload: Record<string, unknown>, opts?: { expiresIn?: string | number }): string;
  verify<T = any>(token: string): T;
}