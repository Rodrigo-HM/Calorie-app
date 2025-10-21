import { EntriesRepository } from '../ports/EntriesRepository';

export class UpdateEntryGrams {
  constructor(private readonly entries: EntriesRepository) {}

  async run(userId: string, id: string, grams: number) {
    const updated = await this.entries.updateGramsForUser(id, userId, grams);
    if (!updated) throw Object.assign(new Error('NOT_FOUND'), { name: 'DomainError' });
    return updated;
  }
}
