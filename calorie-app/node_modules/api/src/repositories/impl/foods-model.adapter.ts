//El adapter “traduce” esas operaciones a tu modelo real (FoodModel) o la DB (LowDB).

import { FoodsRepository } from "../foods.repository";
import { FoodModel } from "../../models/food.model";

export class FoodsModelAdapter implements FoodsRepository {
async list(params: { search?: string; page: number; pageSize: number }) {
const { search, page, pageSize } = params;
// FoodModel.list ya hace db.read() y filtro por search
const all = FoodModel.list(search);
const total = all.length;
const start = (page - 1) * pageSize;
const items = all.slice(start, start + pageSize);
return { items, total, page, pageSize };
}

async getById(id: string) {
const food = FoodModel.getById(id);
return food ?? null;
}
}