import { FoodsRepository } from "../repositories/foods.repository";
export class FoodsService {
constructor(private readonly repo: FoodsRepository) {}

list(params: { search?: string; page: number; pageSize: number }) {
return this.repo.list(params);
}

getById(id: string) {
return this.repo.getById(id);
}
}