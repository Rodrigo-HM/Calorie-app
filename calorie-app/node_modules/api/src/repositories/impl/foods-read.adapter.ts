import { FoodsReadRepository } from "../foods.read.repository";
import { FoodModel } from "../../models/food.model";

export class FoodsReadAdapter implements FoodsReadRepository {
async listAll() {
return FoodModel.list();
}
async getById(id: string) {
const f = FoodModel.getById(id);
return f ? { id: f.id } : null;
}
}