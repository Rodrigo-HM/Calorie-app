import { v4 as uuid } from "uuid";
import { db } from "src/module/shared/infrastructure/db/database";
import type { UsersRepository, User } from "../../aplication/ports/UserRepository";

export class UsersRepositoryLowdb implements UsersRepository {
  async findByEmail(email: string): Promise<User | null> {
    db.read();
    const arr = (db.data!.users ?? []) as User[];
    return arr.find((u) => u.email === email) ?? null;
  }

  async create(data: { email: string; passwordHash: string }): Promise<User> {
    db.read();
    db.data!.users ||= [];
    const arr = db.data!.users as User[];
    const user: User = {
      id: uuid(),
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: new Date().toISOString(),
    };
    arr.push(user);
    db.write();
    return user;
  }
}