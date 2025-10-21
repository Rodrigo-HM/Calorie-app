import { EntriesRepository } from '../ports/EntriesRepository';

export class RemoveEntry {
  constructor(private readonly entries: EntriesRepository) {}

  async run(userId: string, id: string) {
    const removed = await this.entries.deleteByIdForUser(id, userId);
    if (!removed) throw Object.assign(new Error('NOT_FOUND'), { name: 'DomainError' });
    return { ok: true };
  }
}
