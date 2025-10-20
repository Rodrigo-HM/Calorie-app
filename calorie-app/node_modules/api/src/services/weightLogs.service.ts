import { WeightLogsRepository, WeightLog } from "../repositories/weightLogs.repository";

export class WeightLogsService {
constructor(private readonly repo: WeightLogsRepository) {}

list(userId: string, range?: { from?: string; to?: string }): Promise<WeightLog[]> {
if (range?.from && range?.to && range.from > range.to) {
const err = new Error("RANGE_INVALID") as any;
err.code = "RANGE_INVALID";
throw err;
}
return this.repo.listByUser(userId, range);
}

async create(userId: string, data: { dateISO: string; weightKg: number; bodyFat?: number }): Promise<WeightLog> {
if (data.weightKg < 20 || data.weightKg > 400) {
const err = new Error("WEIGHT_OUT_OF_RANGE") as any;
err.code = "WEIGHT_OUT_OF_RANGE";
throw err;
}
if (data.bodyFat != null && (data.bodyFat < 0 || data.bodyFat > 60)) {
const err = new Error("BODYFAT_OUT_OF_RANGE") as any;
err.code = "BODYFAT_OUT_OF_RANGE";
throw err;
}
return this.repo.create(userId, data);
}
}