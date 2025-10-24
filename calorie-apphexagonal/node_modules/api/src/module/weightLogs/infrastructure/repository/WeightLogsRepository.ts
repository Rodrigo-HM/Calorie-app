import { db } from '../../../shared/infrastructure/db/database';

export type WeightLog = {
  id: string;
  userId: string;
  dateISO: string; // 'YYYY-MM-DD' o ISO completo
  weightKg: number;
  bodyFat?: number;
  createdAt: string; // ISO
};

export class WeightLogsRepository {
  async listByUser(
    userId: string,
    range?: { from?: string; to?: string }
  ): Promise<WeightLog[]> {
    db.read();
    let items = ((db.data!.weightLogs as WeightLog[] | undefined) ?? []).filter(
      l => l.userId === userId
    );

    if (range?.from) {
        const fromStart = range.from.includes('T')
            ? range.from
            : `${range.from}T00:00:00.000Z`;
        items = items.filter(l => l.dateISO >= fromStart);
    }


    if (range?.to) {
      const toEnd = range.to.includes('T')
        ? range.to
        : `${range.to}T23:59:59.999Z`;
      items = items.filter(l => l.dateISO <= toEnd);
    }

    return items;
  }

  async create(userId: string, log: Omit<WeightLog, 'userId'>): Promise<WeightLog> {
    db.read();
    db.data!.weightLogs ||= [];
    const arr = db.data!.weightLogs as WeightLog[];
    const item: WeightLog = { userId, ...log };
    arr.push(item);
    db.write();
    return item;
  }
}
