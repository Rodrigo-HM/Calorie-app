import { EntriesRepository, Entry } from "../repositories/entries.repository";
type FoodsLookup = {
getById(id: string): Promise<{ id: string } | null> | { id: string } | null;
};

export class EntriesService {
constructor(
private readonly repo: EntriesRepository,
private readonly foods: FoodsLookup
) {}

async listByDay(userId: string, day: string) {
const items = await this.repo.listByUserAndDay(userId, day);
return items;
}

async create(userId: string, params: { foodId: string; grams: number; dateISO: string }) {
// Asegurar negocio: foodId debe existir
const food = await this.foods.getById(params.foodId);
if (!food) {
const err = new Error("FOOD_NOT_FOUND") as any;
err.code = "FOOD_NOT_FOUND";
throw err;
}
const item = await this.repo.create({ userId, ...params });
return item;
}

async remove(userId: string, id: string) {
const removed = await this.repo.deleteByIdForUser(id, userId);
if (!removed) {
const err = new Error("NOT_FOUND") as any;
err.code = "NOT_FOUND";
throw err;
}
return removed;
}

async update(userId: string, id: string, grams: number) {
const updated = await this.repo.updateGramsForUser(id, userId, grams);
if (!updated) {
const err = new Error("NOT_FOUND") as any;
err.code = "NOT_FOUND";
throw err;
}
return updated;
}
}