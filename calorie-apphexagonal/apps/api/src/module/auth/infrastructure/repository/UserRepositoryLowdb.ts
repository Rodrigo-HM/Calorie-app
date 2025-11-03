import { db } from "../../../shared/infrastructure/db/database";
import { UserRepository } from "../../domain/UserRepository";
import { User } from "../../domain/User";

export class UserRepositoryLowdb implements UserRepository {
  async getByEmail(email: string): Promise<User | null> {
    db.read();
    const row = db.data!.users.find((u: any) => u.email === email.trim().toLowerCase());
    return row ? User.create(row) : null;
  }

  async create(user: User): Promise<User> {
    db.read();
    db.data!.users.push({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    });
    db.write();
    return user;
  }
}