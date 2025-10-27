import type { WeightLogsRepository, WeightLog } from "../../src/module/weightLogs/aplication/ports/WeightLogsRepository";

export function makeWeightLogsRepo(initial: WeightLog[] = []): WeightLogsRepository {
  const data = [...initial];

  return {
    async create(userId, log) {
      const item = { userId, ...log } as WeightLog;
      data.push(item);
      return item;
    },

    async listByUser(userId, range) {
      const all = data.filter((w) => w.userId === userId);
      if (!range?.from && !range?.to) return all;

      return all.filter((w) => {
        const d = w.dateISO.slice(0, 10);
        return (!range.from || d >= range.from) && (!range.to || d <= range.to);
      });
    },

    // __peek: () => data
  };
}
