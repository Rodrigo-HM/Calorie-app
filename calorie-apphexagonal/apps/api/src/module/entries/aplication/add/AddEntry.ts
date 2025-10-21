import { EventBus } from '../ports/EventBus';
import { EntriesRepository } from '../ports/EntriesRepository';
import { FoodsReadRepository } from '../ports/FoodsReadRepository';
import { Clock } from '../ports/Clock';
import { IdGenerator } from '../ports/IdGenerator';

export class AddEntry {
  constructor(
    private readonly entries: EntriesRepository,
    private readonly foods: FoodsReadRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly events: EventBus
  ) {}

  async run(input: { userId: string; foodId: string; grams: number; date?: string }) {
    // Valida existencia del food
    const food = await this.foods.getById(input.foodId);
    if (!food) throw Object.assign(new Error('FOOD_NOT_FOUND'), { name: 'DomainError' });

    const dateISO = input.date ? new Date(input.date).toISOString() : this.clock.now().toISOString();

    // Armamos la entry
    const entry = {
      id: this.ids.nextId(),
      userId: input.userId,
      foodId: input.foodId,
      grams: input.grams,
      date: dateISO,
      createdAt: this.clock.now().toISOString()
    };

    await this.entries.save(entry);

    // Publicar evento
    await this.events.publish([
      {
        eventName: 'entry.added',
        aggregateId: entry.id,
        occurredOn: new Date(),
        payload: { userId: entry.userId, foodId: entry.foodId, grams: entry.grams, date: entry.date }
      }
    ]);

    return { id: entry.id };
  }
}