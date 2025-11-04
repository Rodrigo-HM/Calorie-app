export interface Food {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodsReadRepository {
  listAll(): Promise<Food[]>;

  getById(id: string): Promise<Food | null>;
}
