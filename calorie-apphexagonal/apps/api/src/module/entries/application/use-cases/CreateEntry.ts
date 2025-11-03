import { Entry } from "../../domain/Entry";
import type { EntriesRepository } from "../../domain/EntriesRepository";
import type { FoodsReadRepository } from "../ports/FoodsReadRepository";
import type { IdGenerator } from "../ports/IdGenerator";
import type { Clock } from "../ports/Clock";

export class CreateEntry {
  constructor(
    private readonly entries: EntriesRepository,
    private readonly foods: FoodsReadRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock
  ) {}

  async run(input: { userId: string; foodId: string; grams: number; date?: string }) {
    const food = await this.foods.getById(input.foodId);
    if (!food) throw Object.assign(new Error("FOOD_NOT_FOUND"), { code: "FOOD_NOT_FOUND" });

    const dateISO = input.date ? new Date(input.date).toISOString() : this.clock.now().toISOString();

    const entry = Entry.create({
      id: this.ids.nextId(),
      userId: input.userId,
      foodId: input.foodId,
      grams: input.grams,
      dateISO,
    });

    return this.entries.create(entry);
  }
}