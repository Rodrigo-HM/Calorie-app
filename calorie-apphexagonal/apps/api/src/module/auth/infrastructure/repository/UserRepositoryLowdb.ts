import { db } from "src/module/shared/infrastructure/db/database";
import type { UserRepository } from "../../domain/UserRepository";
import { User } from "../../domain/User";

export class UserRepositoryLowdb implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    db.read();
    const u = (db.data!.users as any[]).find(x => x.email === email);
    return u
      ? User.create({
          id: u.id,
          email: u.email,
          passwordHash: u.passwordHash,
          createdAt: u.createdAt,
        })
      : null;
  }

  async create(user: User): Promise<void> {
    db.read();
    (db.data!.users as any[]).push({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    });
    db.write();
  }
}