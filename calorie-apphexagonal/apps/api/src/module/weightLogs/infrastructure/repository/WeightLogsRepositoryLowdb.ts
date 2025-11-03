import { db } from "../../../shared/infrastructure/db/database";
import type { WeightLogsRepository } from "../../domain/WeightLogsRepository";
import { WeightLog } from "../../domain/WeightLog";

export class WeightLogsRepositoryLowdb implements WeightLogsRepository {
  async listByUser(
    userId: string,
    range?: { from?: string; to?: string }
  ) {
    db.read();
    let items = (db.data!.weightLogs as any[]).filter((w) => w.userId === userId);

    // migración suave: soportar 'date' legacy
    items = items.map((w) => ({
      ...w,
      dateISO: w.dateISO ?? w.date,
    }));

    if (range?.from) {
      const fromISO = `${range.from}T00:00:00.000Z`;
      items = items.filter((w) => (w.dateISO ?? w.date) >= fromISO);
    }
    if (range?.to) {
      const toISO = `${range.to}T23:59:59.999Z`;
      items = items.filter((w) => (w.dateISO ?? w.date) <= toISO);
    }

    return items.map((r) =>
      WeightLog.create({
        id: r.id,
        userId: r.userId,
        dateISO: r.dateISO ?? r.date,
        weightKg: r.weightKg,
        bodyFat: r.bodyFat,
        createdAt: r.createdAt,
      })
    );
  }

  async create(log: WeightLog) {
    db.read();
    (db.data!.weightLogs as any[]).push({
      id: log.id,
      userId: log.userId,
      dateISO: log.dateISO,
      weightKg: log.weightKg,
      bodyFat: log.bodyFat,
      createdAt: log.createdAt,
    });
    db.write();
    return log;
  }
}