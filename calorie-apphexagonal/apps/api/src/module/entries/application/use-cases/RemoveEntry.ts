import type { EntriesRepository } from "../../domain/EntriesRepository";

export class RemoveEntry {
  constructor(private readonly entries: EntriesRepository) {}

  async run(userId: string, id: string) {
    const out = await this.entries.deleteByIdForUser(id, userId);
    if (!out) throw Object.assign(new Error("NOT_FOUND"), { code: "NOT_FOUND" });
  }
}