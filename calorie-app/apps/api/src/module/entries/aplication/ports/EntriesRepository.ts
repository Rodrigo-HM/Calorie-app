export interface EntriesRepository {
  save(entry: any): Promise<void>;
  findByDay(userId: string, dayISO: string): Promise<any[]>;
  updateGramsForUser(id: string, userId: string, grams: number): Promise<any | null>;
  deleteByIdForUser(id: string, userId: string): Promise<any | null>;
}
