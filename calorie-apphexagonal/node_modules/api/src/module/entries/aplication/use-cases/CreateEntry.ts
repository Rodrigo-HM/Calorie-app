// src/module/entries/aplication/use-cases/CreateEntry.ts
import type { ICreateEntry } from "../ports/entries.usecases";
import type { EntriesRepository } from "../ports/EntriesRepository";
import type { FoodsReadRepository } from "../ports/FoodsReadRepository";

export class CreateEntry implements ICreateEntry {
  constructor(
    private readonly entries: EntriesRepository,
    private readonly foods: FoodsReadRepository
  ) {}

  async run(
    userId: string,
    input: { foodId: string; grams: number; dateISO: string }
  ) {
    const food = await this.foods.getById(input.foodId);
    if (!food) {
      const err: any = new Error("FOOD_NOT_FOUND");
      err.code = "FOOD_NOT_FOUND";
      throw err;
    }
    return this.entries.create(userId, input);
  }
}