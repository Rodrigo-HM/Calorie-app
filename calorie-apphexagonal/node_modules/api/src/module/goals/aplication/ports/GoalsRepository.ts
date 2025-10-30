export type Goals = {
  userId: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

// Entrada sin userId (lo pone el repo usando el argumento userId)
export type GoalsInput = Omit<Goals, "userId">;

export interface GoalsRepository {
  get(userId: string): Promise<Goals | null>;
  set(userId: string, g: GoalsInput): Promise<Goals>;
}
