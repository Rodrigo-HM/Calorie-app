import bcrypt from "bcryptjs";
import { PasswordHasher } from "./password-hasher";

export class BcryptHasher implements PasswordHasher {
  constructor(private readonly rounds = 10) {}
  hash(plain: string) { return bcrypt.hash(plain, this.rounds); }
  compare(plain: string, hash: string) { return bcrypt.compare(plain, hash); }
}
