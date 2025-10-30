import { v4 as uuid } from "uuid";
import { db } from "../../../shared/infrastructure/db/database";
import type {
  EntriesRepository as EntriesRepositoryPort,
  Entry,
} from "../../../entries/aplication/ports/EntriesRepository";

export class EntriesRepositoryLowdb implements EntriesRepositoryPort {
  async findByDay(userId: string, dayISO: string): Promise<Entry[]> {
    db.read();
    const arr = (db.data!.entries as any[] | undefined) ?? [];

    return arr
  .filter((e) => e.userId === userId)
  .filter((e) => {
    const iso = (e as any).dateISO ?? (e as any).date ?? "";
    return typeof iso === "string" && iso.length >= 10 && iso.slice(0, 10) === dayISO;
  })
  .map((e) => ({
    id: e.id,
    userId: e.userId,
    foodId: e.foodId,
    grams: e.grams,
    dateISO: (e as any).dateISO ?? (e as any).date,
    createdAt: e.createdAt ?? new Date().toISOString(),
  }));
  }

  async create(
    userId: string,
    data: { foodId: string; grams: number; dateISO: string }
  ): Promise<Entry> {
    db.read();
    db.data!.entries ||= [];
    const arr = db.data!.entries as Entry[];
    const now = new Date().toISOString();
    const item: Entry = {
      id: uuid(),
      userId,
      foodId: data.foodId,
      grams: data.grams,
      dateISO: data.dateISO, // siempre dateISO
      createdAt: now,
    };
    (arr as any).push(item);
    db.write();
    return item;
  }

  async updateGramsForUser(
    id: string,
    userId: string,
    grams: number
  ): Promise<Entry | null> {
    db.read();
    const arr = (db.data!.entries as Entry[] | undefined) ?? [];
    const i = arr.findIndex((e) => e.id === id && e.userId === userId);
    if (i === -1) return null;
    arr[i] = { ...arr[i], grams };
    db.write();
    return arr[i];
  }

  async deleteByIdForUser(id: string, userId: string): Promise<Entry | null> {
    db.read();
    const arr = (db.data!.entries as Entry[] | undefined) ?? [];
    const i = arr.findIndex((e) => e.id === id && e.userId === userId);
    if (i === -1) return null;
    const [removed] = arr.splice(i, 1);
    db.write();
    return removed ?? null;
  }
}