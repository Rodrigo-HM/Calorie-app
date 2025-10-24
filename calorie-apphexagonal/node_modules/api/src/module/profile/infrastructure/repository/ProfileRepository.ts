import { db } from '../../../shared/infrastructure/db/database';

export type Profile = {
  userId: string;
  name?: string;
  age?: number;
  sex?: 'M' | 'F' | 'O';
  updatedAt?: string;
};

export class ProfileRepository {
  async get(userId: string): Promise<Profile | null> {
    db.read();
    return (db.data!.profiles ?? []).find(p => p.userId === userId) ?? null;
  }

  async update(userId: string, patch: Partial<Omit<Profile, 'userId'>>): Promise<Profile> {
    db.read();
    db.data!.profiles ||= [];
    const arr = db.data!.profiles as Profile[];
    const now = new Date().toISOString();
    const i = arr.findIndex(p => p.userId === userId);

    if (i >= 0) {
      arr[i] = { ...arr[i], ...patch, updatedAt: now };
      db.write();
      return arr[i];
    }

    const created: Profile = { userId, ...patch, updatedAt: now };
    arr.push(created);
    db.write();
    return created;
  }
}
