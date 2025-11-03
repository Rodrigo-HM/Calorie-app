import { db } from "../../../shared/infrastructure/db/database";
import type { EntriesRepository } from "../../domain/EntriesRepository";
import { Entry } from "../../domain/Entry";

export class EntriesRepositoryLowdb implements EntriesRepository {
  async listByUserAndDay(userId: string, dayISO: string): Promise<Entry[]> {
    db.read();
    const start = `${dayISO}T00:00:00.000Z`;
    const end = `${dayISO}T23:59:59.999Z`;
    const rows = (db.data!.entries as any[]).filter(
      (e) => e.userId === userId && (e.dateISO ?? e.date) >= start && (e.dateISO ?? e.date) <= end
    );
    return rows.map((r) =>
      Entry.create({
        id: r.id,
        userId: r.userId,
        foodId: r.foodId,
        grams: r.grams,
        dateISO: r.dateISO ?? r.date,
        createdAt: r.createdAt,
      })
    );
  }

  async create(entry: Entry): Promise<Entry> {
    db.read();
    (db.data!.entries as any[]).push({
      id: entry.id,
      userId: entry.userId,
      foodId: entry.foodId,
      grams: entry.grams,
      dateISO: entry.dateISO,
      createdAt: entry.createdAt,
    });
    db.write();
    return entry;
  }

  async updateGramsForUser(id: string, userId: string, grams: number): Promise<Entry | null> {
    db.read();
    const it = (db.data!.entries as any[]).find((e) => e.id === id && e.userId === userId);
    if (!it) return null;
    const updated = Entry.create({
      id: it.id,
      userId: it.userId,
      foodId: it.foodId,
      grams,
      dateISO: it.dateISO ?? it.date,
      createdAt: it.createdAt,
    });
    Object.assign(it, {
      grams: updated.grams,
    });
    db.write();
    return updated;
  }

  async deleteByIdForUser(id: string, userId: string): Promise<Entry | null> {
    db.read();
    const i = (db.data!.entries as any[]).findIndex((e) => e.id === id && e.userId === userId);
    if (i === -1) return null;
    const [it] = (db.data!.entries as any[]).splice(i, 1);
    db.write();
    return Entry.create({
      id: it.id,
      userId: it.userId,
      foodId: it.foodId,
      grams: it.grams,
      dateISO: it.dateISO ?? it.date,
      createdAt: it.createdAt,
    });
  }
}