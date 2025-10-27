import type { FoodsReadRepository } from "../../src/module/foods/aplication/ports/FoodsReadRepository";

export function makeFoodsRepo(foods: any[] = []): FoodsReadRepository {
  return {
    async listAll() {
      return foods;
    },

    async getById(id: string) {
      return foods.find((f) => f.id === id) ?? null;
    },
  };
}
