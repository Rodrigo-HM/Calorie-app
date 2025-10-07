export interface Goals {
userId: string;
kcal: number;
protein: number;
carbs: number;
fat: number;
updatedAt: string;
}

export interface GoalsRepository {
getByUserId(userId: string): Promise<Goals | null>;
upsert(userId: string, data: Omit<Goals, "userId" | "updatedAt">): Promise<Goals>;
}