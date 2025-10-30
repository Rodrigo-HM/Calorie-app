import type {
  FoodsReadRepository,
  Food,
} from "../../src/module/foods/aplication/ports/FoodsReadRepository"; 

export function makeFoodsRepo(foods: Food[] = []): FoodsReadRepository {
  return {
    async listAll(): Promise<Food[]> {
      return foods;
    },
    async getById(id: string): Promise<Food | null> {
      return foods.find((f) => f.id === id) ?? null;
    },
  };
}