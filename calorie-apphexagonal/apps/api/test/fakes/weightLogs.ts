// test/fakes/weightLogs.ts
import type { WeightLogsRepository } from "../../src/module/weightLogs/domain/WeightLogsRepository";
import { WeightLog, type WeightLogCreateProps } from "../../src/module/weightLogs/domain/WeightLog";

// Semilla basada en las props públicas de creación
type Seed = Partial<WeightLogCreateProps> & { userId: string; dateISO: string; id?: string };

export function makeWeightLogsRepo(seed: Seed[] = []): WeightLogsRepository {
  // Normaliza semilla a entidades WeightLog
  const data: WeightLog[] = seed.map((s, i) =>
    WeightLog.create({
      id: s.id ?? `wl_${i + 1}`,
      userId: s.userId,
      dateISO: s.dateISO,
      weightKg: s.weightKg ?? 80,
      bodyFat: s.bodyFat,
      createdAt: s.createdAt ?? "now",
    })
  );

  return {
    async create(log: WeightLog): Promise<WeightLog> {
      // Persistimos la entidad tal cual
      data.push(log);
      return log;
    },

    async listByUser(
      userId: string,
      range?: { from?: string; to?: string }
    ): Promise<WeightLog[]> {
      const all = data.filter((w) => w.userId === userId);
      if (!range?.from && !range?.to) return all;

      // Inclusivo: YYYY-MM-DD → [T00:00:00.000Z, T23:59:59.999Z]
      const fromStart = range?.from
        ? /^\d{4}-\d{2}-\d{2}$/.test(range.from)
          ? `${range.from}T00:00:00.000Z`
          : range.from
        : undefined;

      const toEnd = range?.to
        ? /^\d{4}-\d{2}-\d{2}$/.test(range.to)
          ? `${range.to}T23:59:59.999Z`
          : range.to
        : undefined;

      return all.filter((w) => {
        const iso = w.dateISO;
        return (!fromStart || iso >= fromStart) && (!toEnd || iso <= toEnd);
      });
    },
  };
}