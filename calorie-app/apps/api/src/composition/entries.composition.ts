import { EntriesService } from "../services/entries.service";
import { EntriesModelAdapter } from "../repositories/impl/entries-model.adapter";
import { FoodModel } from "../models/food.model";
class FoodsModelLookup {
getById(id: string) {
return FoodModel.getById(id) ?? null;
}
}

export function buildEntriesService() {
const repo = new EntriesModelAdapter();
const foods = new FoodsModelLookup(); // lookup mínimo
return new EntriesService(repo, foods);
}