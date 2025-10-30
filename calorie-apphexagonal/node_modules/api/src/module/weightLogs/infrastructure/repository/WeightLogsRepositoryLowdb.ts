import { db } from "../../../shared/infrastructure/db/database";
import { v4 as uuid } from "uuid";
import type {
  WeightLogsRepository as WeightLogsRepositoryPort,
  NewWeightLog,
  StoredWeightLog,
} from "../../../weightLogs/aplication/ports/WeightLogsRepository";

export class WeightLogsRepositoryLowdb implements WeightLogsRepositoryPort {
  async listByUser(
    userId: string,
    range?: { from?: string; to?: string }
  ): Promise<StoredWeightLog[]> {
    db.read();
    let items =
      (db.data!.weightLogs as StoredWeightLog[] | undefined)?.filter(
        (l) => l.userId === userId
      ) ?? [];

    if (range?.from) {
      const fromStart = range.from.includes("T")
        ? range.from
        : `${range.from}T00:00:00.000Z`;
      items = items.filter((l) => l.dateISO >= fromStart);
    }

    if (range?.to) {
      const toEnd = range.to.includes("T")
        ? range.to
        : `${range.to}T23:59:59.999Z`;
      items = items.filter((l) => l.dateISO <= toEnd);
    }

    return items;
  }

  async create(userId: string, log: NewWeightLog): Promise<StoredWeightLog> {
    db.read();
    db.data!.weightLogs ||= [];
    const arr = db.data!.weightLogs as StoredWeightLog[];

    const item: StoredWeightLog = {
      id: uuid(),
      userId,
      dateISO: log.dateISO,
      weightKg: log.weightKg,
      bodyFat: log.bodyFat,
      createdAt: new Date().toISOString(),
    };

    arr.push(item);
    db.write();
    return item;
  }
}