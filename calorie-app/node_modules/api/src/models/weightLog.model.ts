import { db } from "../db";
import { v4 as uuid } from "uuid";

export type WeightLog = {
    id: string;
    userId: string;
    date: string; // ISO yyyy-mm-dd
    weightKg: number;
    bodyFat?: number; // %
    createdAt: string; // ISO
};

function ensure() {
    db.read();
    const anyData = db.data as any;
    if (!anyData.weightLogs) anyData.weightLogs = [];
}

export const WeightLogModel = {
    listByUser(userId: string, from?: string, to?: string): WeightLog[] {
    ensure();
    const arr = ((db.data as any).weightLogs as WeightLog[]).filter(w => w.userId === userId);
    let items = arr;
    if (from) items = items.filter(w => w.date >= from);
    if (to) items = items.filter(w => w.date <= to);
    return items.sort((a, b) => a.date.localeCompare(b.date));
},

create(userId: string, d: { date?: string; weightKg: number; bodyFat?: number }): WeightLog {
    ensure();
    const now = new Date();
    const log: WeightLog = {
    id: uuid(),
    userId,
    date: (d.date ? new Date(d.date) : now).toISOString().slice(0, 10),
    weightKg: d.weightKg,
    bodyFat: d.bodyFat,
    createdAt: now.toISOString(),
    };
    (db.data as any).weightLogs.push(log);
    db.write();
    return log;
},
};