import { FoodsService } from "../services/foods.service";
import { FoodsModelAdapter } from "../repositories/impl/foods-model.adapter";

export function buildFoodsService() {
const repo = new FoodsModelAdapter();
return new FoodsService(repo);
}