export interface WeightLog {
id: string;
userId: string;
date: string; // ISO almacenado
weightKg: number;
bodyFat?: number; // %
createdAt: string;
}

export interface WeightLogsRepository {
listByUser(userId: string, range?: { from?: string; to?: string }): Promise<WeightLog[]>;
create(userId: string, data: { dateISO: string; weightKg: number; bodyFat?: number }): Promise<WeightLog>;
}