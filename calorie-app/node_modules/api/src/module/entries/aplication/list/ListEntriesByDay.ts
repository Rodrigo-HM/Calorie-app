import { EntriesRepository } from '../ports/EntriesRepository';
import { FoodsReadRepository } from '../ports/FoodsReadRepository';

export class ListEntriesByDay {
  constructor(
    private readonly entries: EntriesRepository,
    private readonly foods: FoodsReadRepository
  ) {}

  async run(userId: string, dayISO: string) {
    const items = await this.entries.findByDay(userId, dayISO);
    const foods = await this.foods.listAll();

    // Totales
    const totals = items.reduce((acc: any, e: any) => {
      const food = foods.find((f: any) => f.id === e.foodId);
      if (!food) return acc;
      const factor = e.grams / 100;
      acc.kcal += Math.round(food.kcal * factor);
      acc.protein += food.protein * factor;
      acc.carbs += food.carbs * factor;
      acc.fat += food.fat * factor;
      return acc;
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

    return { items, totals };
  }
}
