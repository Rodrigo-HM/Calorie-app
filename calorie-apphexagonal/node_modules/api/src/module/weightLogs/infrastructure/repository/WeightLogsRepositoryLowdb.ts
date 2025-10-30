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

    // 1) Filtrar por userId
    const raw: any[] = (db.data!.weightLogs as any[] | undefined) ?? [];
    let items = raw.filter((w) => w.userId === userId);

    // 2) Rango inclusivo (acepta YYYY-MM-DD o ISO)
    if (range?.from || range?.to) {
      const fromStart = range?.from
        ? (/^\d{4}-\d{2}-\d{2}$/.test(range.from) ? `${range.from}T00:00:00.000Z` : range.from)
        : undefined;
      const toEnd = range?.to
        ? (/^\d{4}-\d{2}-\d{2}$/.test(range.to) ? `${range.to}T23:59:59.999Z` : range.to)
        : undefined;

      items = items.filter((w) => {
        // Compat: usar dateISO si existe, sino date (legacy)
        const iso: string = (w.dateISO ?? w.date) as string;
        if (typeof iso !== "string" || iso.length < 10) return false;
        return (!fromStart || iso >= fromStart) && (!toEnd || iso <= toEnd);
      });
    }

    // 3) Normalizar a StoredWeightLog (dateISO siempre presente)
    const normalized: StoredWeightLog[] = items.map((w: any) => ({
      id: w.id,
      userId: w.userId,
      dateISO: (w.dateISO ?? w.date) as string,
      weightKg: w.weightKg,
      bodyFat: w.bodyFat,
      createdAt: w.createdAt ?? new Date().toISOString(),
    }));

    // 4) (Opcional) Ordenar por fecha ascendente para respuestas deterministas
    normalized.sort((a, b) => a.dateISO.localeCompare(b.dateISO));

    return normalized;
  }

  async create(userId: string, log: NewWeightLog): Promise<StoredWeightLog> {
    db.read();
    db.data!.weightLogs ||= [];
    const arr = db.data!.weightLogs as StoredWeightLog[];

    const item: StoredWeightLog = {
      id: uuid(),
      userId,
      dateISO: log.dateISO, // siempre guardamos dateISO
      weightKg: log.weightKg,
      bodyFat: log.bodyFat,
      createdAt: new Date().toISOString(),
    };

    arr.push(item);
    db.write();
    return item;
  }
}