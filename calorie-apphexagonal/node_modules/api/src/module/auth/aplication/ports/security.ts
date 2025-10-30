import type { StringValue } from "ms";

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface TokenService {
  sign(
    payload: Record<string, unknown>,
    opts?: { expiresIn?: StringValue | number }
  ): string;

  verify<T = any>(token: string): T;
}