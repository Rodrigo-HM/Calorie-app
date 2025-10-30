export type Food = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export interface FoodsReadRepository {
  getById(id: string): Promise<Food | null>;
  listAll(): Promise<Food[]>;
}