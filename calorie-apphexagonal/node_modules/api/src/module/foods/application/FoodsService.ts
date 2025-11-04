import type { FoodsReadRepository } from "../domain/FoodsReadRepository";

export type ListFoodsInput = {
  search?: string;
  page?: number;      // 1-based
  pageSize?: number;  // max: 100
};

export class FoodsService {
  private readonly MAX_PAGE_SIZE = 100;

  constructor(private readonly repo: FoodsReadRepository) {}

  async list(input: ListFoodsInput = {}) {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(this.MAX_PAGE_SIZE, Math.max(1, input.pageSize ?? 20));
    const search = (input.search ?? "").trim().toLowerCase();

    const all = await this.repo.listAll();

    const filtered = search
      ? all.filter((f) =>
          `${f.name} ${f.kcal} ${f.protein} ${f.carbs} ${f.fat}`
            .toLowerCase()
            .includes(search)
        )
      : all;

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async getById(id: string) {
    return this.repo.getById(id);
  }
}