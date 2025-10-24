import { db } from '../../../shared/infrastructure/db/database';

export type Goals = {
  userId: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  updatedAt?: string;
};

export class GoalsRepository {
  async get(userId: string): Promise<Goals | null> {
    db.read();
    return (db.data!.goals ?? []).find(g => g.userId === userId) ?? null;
  }

  async set(userId: string, data: Omit<Goals, 'userId' | 'updatedAt'>): Promise<Goals> {
    db.read();
    db.data!.goals ||= [];
    const arr = db.data!.goals as Goals[];
    const now = new Date().toISOString();
    const i = arr.findIndex(g => g.userId === userId);

    if (i >= 0) {
      arr[i] = { ...arr[i], ...data, updatedAt: now };
      db.write();
      return arr[i];
    }

    const created: Goals = { userId, ...data, updatedAt: now };
    arr.push(created);
    db.write();
    return created;
  }
}
