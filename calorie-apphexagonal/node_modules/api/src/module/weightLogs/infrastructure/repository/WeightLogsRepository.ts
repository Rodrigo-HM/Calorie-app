import { db } from "../../../shared/infrastructure/db/database";
import { v4 as uuid } from "uuid";
import type {
  NewWeightLog,
  StoredWeightLog,
} from "../../aplication/ports/WeightLogsRepository";

export class WeightLogsRepository {
  async listByUser(
    userId: string,
    range?: { from?: string; to?: string }
  ): Promise<StoredWeightLog[]> {
    db.read();
    let items =
      (db.data!.weightLogs as StoredWeightLog[] | undefined)?.filter(
        (l) => l.userId === userId
      ) ?? [];

    // Filtrado por fecha desde
    if (range?.from) {
      const fromStart = range.from.includes("T")
        ? range.from
        : `${range.from}T00:00:00.000Z`;
      items = items.filter((l) => l.dateISO >= fromStart);
    }

    // Filtrado por fecha hasta
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
