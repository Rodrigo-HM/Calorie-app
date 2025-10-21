import { v4 as uuid } from 'uuid';
import { db } from 'src/module/shared/infrastructure/db/database';
import { User, UserRepository } from '../../repository/user.repository';

export class UserRepositoryLowdb implements UserRepository {
  async getByEmail(email: string): Promise<User | null> {
    db.read();
    const arr = (db.data!.users ?? []) as User[];
    return arr.find(u => u.email === email) ?? null;
  }

  async create(email: string, passwordHash: string): Promise<User> {
    db.read();
    db.data!.users ||= [];
    const arr = db.data!.users as User[];
    const user: User = {
      id: uuid(),
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    arr.push(user);
    db.write();
    return user;
  }
}
