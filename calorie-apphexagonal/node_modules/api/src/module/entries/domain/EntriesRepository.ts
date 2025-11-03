import { Entry } from "./Entry";
export { Entry } from "./Entry"; // re-export para compat en tests que importan Entry desde aquí

export interface EntriesRepository {
  listByUserAndDay(userId: string, dayISO: string): Promise<Entry[]>;
  create(entry: Entry): Promise<Entry>;
  updateGramsForUser(id: string, userId: string, grams: number): Promise<Entry | null>;
  deleteByIdForUser(id: string, userId: string): Promise<Entry | null>;
}