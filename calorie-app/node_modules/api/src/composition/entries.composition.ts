import { EntriesService } from "../services/entries.service";
import { EntriesModelAdapter } from "../repositories/impl/entries-model.adapter";
import { FoodsReadAdapter } from "../repositories/impl/foods-read.adapter";

export function buildEntriesService() {
const repo = new EntriesModelAdapter();
const foods = new FoodsReadAdapter();
return new EntriesService(repo, foods);
}