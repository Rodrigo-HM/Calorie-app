export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface TokenService {
  sign(
    payload: Record<string, unknown>,
    opts?: { expiresIn?: string | number }
  ): Promise<string>;

  verify<T = unknown>(token: string): Promise<T>;
}