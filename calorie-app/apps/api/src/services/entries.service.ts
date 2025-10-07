import { EntriesRepository } from "../repositories/entries.repository";
import { FoodsReadRepository } from "../repositories/foods.read.repository";
export class EntriesService {
constructor(
private readonly repo: EntriesRepository,
private readonly foods: FoodsReadRepository
) {}

async listByDay(userId: string, day: string) {
return this.repo.listByUserAndDay(userId, day);
}

async listWithTotals(userId: string, day: string) {
const items = await this.repo.listByUserAndDay(userId, day);
const foods = await this.foods.listAll();
const map = new Map(foods.map((f) => [f.id, f]));
const totals = items.reduce(
(acc, e) => {
const f = map.get(e.foodId);
if (!f) return acc;
const factor = e.grams / 100;
acc.kcal += f.kcal * factor;
acc.protein += f.protein * factor;
acc.carbs += f.carbs * factor;
acc.fat += f.fat * factor;
return acc;
},
{ kcal: 0, protein: 0, carbs: 0, fat: 0 }
);
return { items, totals };
}

async create(userId: string, params: { foodId: string; grams: number; dateISO: string }) {
// Validación: el alimento debe existir
const food = await this.foods.getById(params.foodId);
if (!food) {
const err = new Error("FOOD_NOT_FOUND") as any;
err.code = "FOOD_NOT_FOUND";
throw err;
}
return this.repo.create({ userId, ...params });
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