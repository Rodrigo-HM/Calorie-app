import { EntriesRepository, Entry } from "../entries.repository";
import { EntryModel } from "../../models/entry.model";
import { db } from "../../database";


export class EntriesModelAdapter implements EntriesRepository {
async listByUserAndDay(userId: string, day: string): Promise<Entry[]> {
// EntryModel ya hace db.read() internamente
return EntryModel.listByUserAndDay(userId, day) as any;
}

async create(params: { userId: string; foodId: string; grams: number; dateISO: string }): Promise<Entry> {
const { userId, foodId, grams, dateISO } = params;
return EntryModel.create(userId, foodId, grams, dateISO) as any;
}

async deleteByIdForUser(id: string, userId: string): Promise<Entry | null> {
const removed = EntryModel.deleteByIdForUser(id, userId);
return (removed as any) ?? null;
}

async updateGramsForUser(id: string, userId: string, grams: number): Promise<Entry | null> {
// Update no existe en EntryModel; usamos db directo 
db.read();
const arr = (db.data as any).entries as any[];
const item = arr.find((e) => e.id === id && e.userId === userId);
if (!item) return null;
item.grams = grams;
db.write();
return item as any;
}
}