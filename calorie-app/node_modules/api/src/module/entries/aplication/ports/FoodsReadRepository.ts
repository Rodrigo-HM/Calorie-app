export interface FoodsReadRepository {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any | null>;
}
