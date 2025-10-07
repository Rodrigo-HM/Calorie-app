export interface FoodsReadRepository {
listAll(): Promise<Array<{
id: string;
name: string;
kcal: number;
protein: number;
carbs: number;
fat: number;
}>>;
getById(id: string): Promise<{ id: string } | null>;
}