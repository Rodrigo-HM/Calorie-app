export type NewWeightLog = {
  dateISO: string;
  weightKg: number;
  bodyFat?: number;
};

export type StoredWeightLog = {
  id: string;
  userId: string;
  dateISO: string;
  weightKg: number;
  bodyFat?: number;
  createdAt: string;
};

export interface WeightLogsRepository {
  create(userId: string, log: NewWeightLog): Promise<StoredWeightLog>;

  listByUser(
    userId: string,
    range?: { from?: string; to?: string }
  ): Promise<StoredWeightLog[]>;
}
