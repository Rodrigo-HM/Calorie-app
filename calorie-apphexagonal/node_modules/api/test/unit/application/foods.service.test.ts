import { FoodsService } from "src/module/foods/application/FoodsService";
import type { FoodsReadRepository } from "src/module/foods/domain/FoodsReadRepository";

const foodsRepo: FoodsReadRepository = {
  listAll: async () => [
    { id:"f1", name:"Chicken", kcal:165, protein:31, carbs:0, fat:3.6 },
    { id:"f2", name:"Rice", kcal:130, protein:2.4, carbs:28, fat:0.3 },
  ],
  getById: async () => null,
};

test("search is case-insensitive and trimmed", async () => {
  const svc = new FoodsService(foodsRepo);
  const out = await svc.list({ search: "  chi  " });
  expect(out.items.map(i=>i.name)).toEqual(["Chicken"]);
});

test("pagination clamps page and pageSize", async () => {
  const svc = new FoodsService(foodsRepo);
  const out = await svc.list({ page: 0, pageSize: 1000 });
  expect(out.page).toBe(1);
  expect(out.pageSize).toBe(100);
});