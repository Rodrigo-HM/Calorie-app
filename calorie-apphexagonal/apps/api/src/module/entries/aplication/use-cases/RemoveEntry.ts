import type { IRemoveEntry } from "../ports/entries.usecases";
import type { EntriesRepository } from "../ports/EntriesRepository";

export class RemoveEntry implements IRemoveEntry {
  constructor(private readonly entries: EntriesRepository) {}

  async run(userId: string, entryId: string): Promise<void> {
    const removed = await this.entries.deleteByIdForUser(entryId, userId);
    if (!removed) {
      const err: any = new Error("NOT_FOUND");
      err.code = "NOT_FOUND";
      throw err;
    }
    // No returns; el controller da forma a la respuesta HTTP
  }
}