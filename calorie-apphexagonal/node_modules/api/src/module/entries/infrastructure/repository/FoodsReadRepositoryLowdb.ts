import { db } from "../../../shared/infrastructure/db/database";
import type {
  FoodsReadRepository as FoodsReadRepositoryPort,
  Food,
} from "../../../foods/domain/FoodsReadRepository";

export class FoodsReadRepositoryLowdb implements FoodsReadRepositoryPort {
  async getById(id: string): Promise<Food | null> {
    db.read();
    const foods = (db.data!.foods as Food[] | undefined) ?? [];
    return foods.find((f) => f.id === id) ?? null;
  }

  async listAll(): Promise<Food[]> {
    db.read();
    return (db.data!.foods as Food[] | undefined) ?? [];
  }
}