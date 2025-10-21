import { db } from '../../../shared/infrastructure/db/database';

export class FoodsReadRepository {
  async listAll() {
    db.read();
    return db.data!.foods;
  }

  async getById(id: string) {
    db.read();
    return db.data!.foods.find(f => f.id === id) ?? null;
  }
}
