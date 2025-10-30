import type {
  WeightLogsRepository,
  NewWeightLog,
  StoredWeightLog,
} from "../../src/module/weightLogs/aplication/ports/WeightLogsRepository";

type Seed = Partial<StoredWeightLog> & { userId: string; id?: string; dateISO: string };

export function makeWeightLogsRepo(seed: Seed[] = []): WeightLogsRepository {
  // Normaliza el seed al tipo StoredWeightLog
  const data: StoredWeightLog[] = seed.map((s, i) => ({
    id: s.id ?? `wl_${i + 1}`,
    userId: s.userId,
    dateISO: s.dateISO,
    weightKg: s.weightKg ?? 80,
    bodyFat: s.bodyFat,
    createdAt: s.createdAt ?? "now",
  }));

  return {
    async create(userId: string, log: NewWeightLog): Promise<StoredWeightLog> {
      const item: StoredWeightLog = {
        id: `wl_${data.length + 1}`,
        userId,
        dateISO: log.dateISO,
        weightKg: log.weightKg,
        bodyFat: log.bodyFat,
        createdAt: "now",
      };
      data.push(item);
      return item;
    },

    async listByUser(
      userId: string,
      range?: { from?: string; to?: string }
    ): Promise<StoredWeightLog[]> {
      const all = data.filter((w) => w.userId === userId);
      if (!range?.from && !range?.to) return all;

      // Inclusivo: YYYY-MM-DD → expandimos a T00:00:00.000Z / T23:59:59.999Z
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