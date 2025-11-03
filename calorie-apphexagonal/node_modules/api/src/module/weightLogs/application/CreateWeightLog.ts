import { WeightLog } from "../domain/WeightLog";
import type { WeightLogsRepository } from "../domain/WeightLogsRepository";
import type { Clock } from "./ports/Clock";
import type { IdGenerator } from "../application/ports/IdGenerator";

export class CreateWeightLog {
  constructor(
    private readonly repo: WeightLogsRepository,
    private readonly ids: IdGenerator,
    private readonly clock: Clock
  ) {}

  async run(input: { userId: string; date?: string; weightKg: number; bodyFat?: number }) {
    const dateISO = input.date ? new Date(input.date).toISOString() : this.clock.now().toISOString();

    const log = WeightLog.create({
      id: this.ids.nextId(),
      userId: input.userId,
      dateISO,
      weightKg: input.weightKg,
      bodyFat: input.bodyFat,
    });

    return this.repo.create(log);
  }
}