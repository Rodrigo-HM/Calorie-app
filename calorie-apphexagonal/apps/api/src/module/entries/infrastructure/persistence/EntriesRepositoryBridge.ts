import { EntriesModelAdapter } from 'src/repositories/impl/entries-model.adapter';
import { EntriesRepository } from '../../../entries/aplication/ports/EntriesRepository';
// Ajusta la ruta al adaptador legacy real

export class EntriesRepositoryBridge implements EntriesRepository {
  constructor(private readonly legacy: EntriesModelAdapter) {}

  async save(entry: any): Promise<void> {
    // En legacy probablemente es create(...)
    await this.legacy.create(entry);
  }

  async findByDay(userId: string, dayISO: string): Promise<any[]> {
    // En legacy probablemente es listByUserAndDay(...)
    return this.legacy.listByUserAndDay(userId, dayISO);
  }

  async updateGramsForUser(id: string, userId: string, grams: number) {
    return this.legacy.updateGramsForUser(id, userId, grams);
  }

  async deleteByIdForUser(id: string, userId: string) {
    return this.legacy.deleteByIdForUser(id, userId);
  }
}
