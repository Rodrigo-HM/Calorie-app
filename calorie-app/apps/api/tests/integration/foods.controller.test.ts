import { describe, it, expect, beforeEach } from "vitest";
import { bootstrap, foodsApi } from "../utils";

let app: import("express").Express;
let foods: ReturnType<typeof foodsApi>;

beforeEach(async () => {
  app = await bootstrap();
  foods = foodsApi(app);
});

describe("FoodsController", () => {
  it("GET /api/foods -> 200 y devuelve lista", async () => {
    const res = await foods.list();
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    expect(res.body[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        kcal: expect.any(Number),
        protein: expect.any(Number),
        carbs: expect.any(Number),
        fat: expect.any(Number),
      })
    );
  });

  it("GET /api/foods?search=pollo filtra por nombre", async () => {
    const res = await foods.list({ search: "pollo" });
    expect(res.status).toBe(200);

    for (const f of res.body) {
      expect(f.name.toLowerCase()).toContain("pollo");
    }
  });

  it("GET /api/foods/:id devuelve el alimento", async () => {
    const listRes = await foods.list();
    const anyFood = listRes.body[0];

    const res = await foods.getById(anyFood.id);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: anyFood.id,
      name: anyFood.name,
      kcal: anyFood.kcal,
      protein: anyFood.protein,
      carbs: anyFood.carbs,
      fat: anyFood.fat,
    });
  });

  it("GET /api/foods/:id con id inexistente -> 404", async () => {
    const res = await foods.getById("no-such-id");
    expect(res.status).toBe(404);
  });
});
