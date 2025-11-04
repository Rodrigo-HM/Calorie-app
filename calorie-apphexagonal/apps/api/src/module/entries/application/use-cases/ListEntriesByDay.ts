import type { EntriesRepository, Entry } from "../../domain/EntriesRepository";
import type { FoodsReadRepository } from "../../domain/FoodsReadRepository";

export class ListEntriesByDay {
  constructor(
    private readonly entries: EntriesRepository,
    private readonly foods: FoodsReadRepository
  ) {}

  async run(
    userId: string,
    dayISO: string
  ): Promise<{ items: Entry[]; totals: { kcal: number; protein: number; carbs: number; fat: number } }> {
    const items = await this.entries.listByUserAndDay(userId, dayISO);
    const foods = await this.foods.listAll();
    const index = new Map(foods.map((f) => [f.id, f]));

    const totals = items.reduce(
      (acc, e) => {
        const f = index.get(e.foodId);
        if (!f) return acc;
        const factor = e.grams / 100;
        acc.kcal += f.kcal * factor;
        acc.protein += f.protein * factor;
        acc.carbs += f.carbs * factor;
        acc.fat += f.fat * factor;
        return acc;
      },
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return { items, totals };
  }
}