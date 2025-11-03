import type { WeightLogsRepository, WeightLog } from "../domain/WeightLogsRepository";

export class ListWeightLogs {
  constructor(private readonly repo: WeightLogsRepository) {}

  async run(input: { userId: string; from?: string; to?: string }): Promise<WeightLog[]> {
    const { userId, from, to } = input;

    if (from && to && from > to) {
      throw Object.assign(new Error("RANGE_INVALID"), { code: "RANGE_INVALID" });
    }

    return this.repo.listByUser(userId, { from, to });
  }
}