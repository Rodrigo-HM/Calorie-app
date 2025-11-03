export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly createdAt: string
  ) {}

  static create(params: { id: string; email: string; passwordHash: string; createdAt?: string }) {
    const email = params.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("EMAIL_INVALID");
    if (!params.passwordHash) throw new Error("PASSWORD_HASH_REQUIRED");
    const createdAt = params.createdAt ?? new Date().toISOString();
    return new User(params.id, email, params.passwordHash, createdAt);
  }
}