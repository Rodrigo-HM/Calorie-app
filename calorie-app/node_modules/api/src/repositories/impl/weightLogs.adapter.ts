import { db } from "../../database";
import { v4 as uuid } from "uuid";
import { WeightLogsRepository, WeightLog } from "../weightLogs.repository";

export class WeightLogsAdapter implements WeightLogsRepository {
async listByUser(userId: string, range?: { from?: string; to?: string }): Promise<WeightLog[]> {
db.read();
const arr = (db.data as any).weightLogs as WeightLog[] | undefined;
let out = (arr ?? []).filter(w => w.userId === userId);
if (range?.from) out = out.filter(w => w.date >= range.from!);
if (range?.to) out = out.filter(w => w.date <= range.to!);
out.sort((a, b) => a.date.localeCompare(b.date));
return out;
}

async create(userId: string, data: { dateISO: string; weightKg: number; bodyFat?: number }): Promise<WeightLog> {
db.read();
const store = (db.data as any);
store.weightLogs ||= [];
const arr = store.weightLogs as WeightLog[];
const item: WeightLog = {
id: uuid(),
userId,
date: data.dateISO,
weightKg: data.weightKg,
bodyFat: data.bodyFat,
createdAt: new Date().toISOString(),
};
arr.push(item);
db.write();
return item;
}
}