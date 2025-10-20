export type WeightLog = {
  userId: string;
  dateISO: string;
  weightKg: number;
  bodyFat?: number;
};

export interface WeightLogsRepository {
  create(userId: string, log: Omit<WeightLog, 'userId'>): Promise<WeightLog>;
  listByUser(
    userId: string,
    range?: { from?: string; to?: string }
  ): Promise<WeightLog[]>;
}
