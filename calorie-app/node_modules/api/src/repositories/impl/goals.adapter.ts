import { Goals, GoalsRepository } from "../goals.repository";
import { db } from "../../db";

export class GoalsAdapter implements GoalsRepository {
async getByUserId(userId: string): Promise<Goals | null> {
db.read();
const goals = (db.data as any).goals as Goals[] | undefined;
if (!goals) return null;
const found = goals.find(g => g.userId === userId);
return found ?? null;
}

async upsert(
userId: string,
data: Omit<Goals, "userId" | "updatedAt">
): Promise<Goals> {
db.read();
const store = (db.data as any);
store.goals ||= [];
const arr = store.goals as Goals[];

const now = new Date().toISOString();
const idx = arr.findIndex(g => g.userId === userId);
if (idx >= 0) {
  arr[idx] = { ...arr[idx], ...data, updatedAt: now };
  db.write();
  return arr[idx];
}
const created: Goals = { userId, ...data, updatedAt: now };
arr.push(created);
db.write();
return created;
}
}