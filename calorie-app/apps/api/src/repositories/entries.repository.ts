export interface Entry {
id: string;
userId: string;
foodId: string;
grams: number;
date: string; // ISO string
createdAt: string;
}
export interface EntriesRepository {
listByUserAndDay(userId: string, day: string): Promise<Entry[]>;
create(params: { userId: string; foodId: string; grams: number; dateISO: string }): Promise<Entry>;
deleteByIdForUser(id: string, userId: string): Promise<Entry | null>;
updateGramsForUser(id: string, userId: string, grams: number): Promise<Entry | null>;
}