import { db } from '../../../shared/infrastructure/db/database';

export type Entry = {
  id: string;
  userId: string;
  foodId: string;
  grams: number;
  date: string; // ISO completo, ej: 2025-10-21T09:00:00.000Z
  createdAt: string; // ISO
};

export class EntriesRepository {
  async save(e: Entry): Promise<void> {
    db.read();
    db.data!.entries ||= [];
    (db.data!.entries as Entry[]).push(e);
    db.write();
  }

  // dayISO: 'YYYY-MM-DD'
  async findByDay(userId: string, dayISO: string): Promise<Entry[]> {
    db.read();
        const start = `${dayISO}T00:00:00.000Z`;
        const end = `${dayISO}T23:59:59.999Z`;
    const items = (db.data!.entries as Entry[] | undefined) ?? [];
    return items.filter(
      e => e.userId === userId && e.date >= start && e.date <= end
    );
  }

  async updateGramsForUser(
    id: string,
    userId: string,
    grams: number
  ): Promise<Entry | null> {
    db.read();
    const arr = (db.data!.entries as Entry[] | undefined) ?? [];
    const it = arr.find(e => e.id === id && e.userId === userId);
    if (!it) return null;
    it.grams = grams;
    db.write();
    return it;
  }

  async deleteByIdForUser(id: string, userId: string): Promise<Entry | null> {
    db.read();
    const arr = (db.data!.entries as Entry[] | undefined) ?? [];
    const i = arr.findIndex(e => e.id === id && e.userId === userId);
    if (i < 0) return null;
    const [removed] = arr.splice(i, 1);
    db.write();
    return removed ?? null;
  }
}
