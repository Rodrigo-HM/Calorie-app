import bcrypt from "bcryptjs";
import type { Hasher } from "../../application/ports/security";

export class BcryptHasher implements Hasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}