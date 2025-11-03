import type { EntriesRepository } from "../../domain/EntriesRepository";

export class UpdateEntryGrams {
  constructor(private readonly entries: EntriesRepository) {}

  async run(userId: string, id: string, grams: number) {
    if (!Number.isFinite(grams) || grams <= 0) {
      throw Object.assign(new Error("GRAMS_INVALID"), { code: "GRAMS_INVALID" });
    }
    const out = await this.entries.updateGramsForUser(id, userId, grams);
    if (!out) throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
    return out;
  }
}