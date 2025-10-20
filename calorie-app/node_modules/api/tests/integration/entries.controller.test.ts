import { describe, it, expect, beforeEach, vi } from "vitest";
import jwt from "jsonwebtoken";
import { bootstrap, entriesApi } from "../utils";

let app: import("express").Express;

// Helper para obtener un food válido (usa el seed)
async function getAnyFoodId() {
  const { FoodModel } = await import("../../src/models/food.model");
  const foods = FoodModel.list();
  if (!foods.length) throw new Error("No hay foods seed");
  return foods[0].id;
}

beforeEach(async () => {
  vi.useRealTimers();
  app = await bootstrap();
});

describe("EntriesController", () => {

  it("GET /api/entries sin token en test -> 200", async () => {
    // No token, usamos request directo
    const res = await entriesApi(app, "" as any).list(); //token vacío para simular sin auth
    expect(res.status).toBe(200); //debe ser 200 OK
    expect(res.body).toHaveProperty("items");
    expect(res.body).toHaveProperty("totals");
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it("POST crea una entry y GET la lista hoy con totales", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-10-01T10:00:00Z")); //fijamos fecha para el test

    const foodId = await getAnyFoodId(); //obtenemos un foodId válido
    const entries = entriesApi(app); // token por defecto: "test"
    const created = await entries.create({ foodId, grams: 150 }); //creamos la entry

    expect(created.status).toBe(201); //debe ser 201 Created
    expect(created.body).toMatchObject({ id: expect.any(String), foodId, grams: 150 }); //debe devolver la entry creada

    // Ahora listamos y debe aparecer la entry creada y los totales calculados
    const list = await entries.list();
    expect(list.status).toBe(200);
    expect(list.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: created.body.id, foodId, grams: 150 }),
      ])
    );
    // La lista debe tener totales calculados
    expect(list.body.totals).toEqual(
      expect.objectContaining({
        kcal: expect.any(Number),
        protein: expect.any(Number),
        carbs: expect.any(Number),
        fat: expect.any(Number),
      })
    );

    vi.useRealTimers(); //restauramos timers reales
  });

  it("POST con payload inválido -> 400", async () => {
    const foodId = await getAnyFoodId();
    const entries = entriesApi(app);

    // falta foodId
    await entries.create({ grams: 100 }).expect(400);

    // grams inválidos
    await entries.create({ foodId, grams: 0 }).expect(400);
    await entries.create({ foodId, grams: 12.5 }).expect(400);

    // foodId inexistente
    await entries.create({ foodId: "no-such", grams: 100 }).expect(400);
  });

  it("DELETE borra la entry propia -> 200 y deja de listarse", async () => {
    const foodId = await getAnyFoodId();
    const entries = entriesApi(app);

    const created = await entries.create({ foodId, grams: 100 });
    expect(created.status).toBe(201);

    const del = await entries.remove(created.body.id);
    expect(del.status).toBe(200);
    expect(del.body.id).toBe(created.body.id);

    const list = await entries.list();
    const ids = list.body.items.map((i: any) => i.id);
    expect(ids).not.toContain(created.body.id);
  });

  it("DELETE de entry de otro usuario -> 404", async () => {
    const foodId = await getAnyFoodId();

    // Usuario A crea la entry (token "test")
    const entriesA = entriesApi(app, "test");
    const created = await entriesA.create({ foodId, grams: 120 });
    expect(created.status).toBe(201);

    // Usuario B con token distinto
    const tokenUserB = jwt.sign(
      { sub: "other-user" },
      process.env.JWT_SECRET || "dev_secret_change_me"
    );
    const entriesB = entriesApi(app, tokenUserB);

    await entriesB.remove(created.body.id).expect(404);
  });

});
