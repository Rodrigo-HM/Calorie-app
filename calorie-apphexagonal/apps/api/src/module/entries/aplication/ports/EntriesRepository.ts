export type Entry = {
  id: string;
  userId: string;
  foodId: string;
  grams: number;
  dateISO: string;
  createdAt: string;
};

export interface EntriesRepository {
  // Mantén el nombre que usa tu caso de uso:
  findByDay(userId: string, dayISO: string): Promise<Entry[]>;

  create(
    userId: string,
    data: { foodId: string; grams: number; dateISO: string }
  ): Promise<Entry>;

  updateGramsForUser(
    id: string,
    userId: string,
    grams: number
  ): Promise<Entry | null>;

  deleteByIdForUser(id: string, userId: string): Promise<Entry | null>;
}