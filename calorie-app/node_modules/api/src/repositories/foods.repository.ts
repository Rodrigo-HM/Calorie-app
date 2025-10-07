export interface FoodsRepository {
list(params: { search?: string; page: number; pageSize: number }): Promise<{
items: Array<{
id: string;
name: string;
kcal: number;
protein: number;
carbs: number;
fat: number;
createdAt: string;
}>;
total: number;
page: number;
pageSize: number;
}>;
getById(id: string): Promise<{
id: string;
name: string;
kcal: number;
protein: number;
carbs: number;
fat: number;
createdAt: string;
} | null>;
}