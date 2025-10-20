export type Goals = {
  userId: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export interface GoalsRepository {
  get(userId: string): Promise<Goals | null>;
  set(userId: string, g: Omit<Goals, 'userId'>): Promise<Goals>;
}
