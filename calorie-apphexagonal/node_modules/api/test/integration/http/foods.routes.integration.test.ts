import request from "supertest";
import { buildApp } from "../../../src/module/shared/infrastructure/http/express/AppBuilder";
import { withTempDb } from "../../helpers/withTempDb";
import { initDb } from "../../../src/module/shared/infrastructure/db/database";
import { db } from "../../../src/module/shared/infrastructure/db/database";

describe("Foods routes (integration HTTP)", () => {
  it(
    "GET /api/foods → devuelve la lista (incluye un item insertado)",
    withTempDb(async () => {
      process.env.NODE_ENV = "test";
      initDb();
      const app = buildApp();

      // Insertamos un food conocido en la DB temporal para tener un dato determinista
      db.read();
      (db.data!.foods as any[]).push({
        id: "f1",
        name: "Chicken",
        kcal: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        createdAt: new Date().toISOString(),
      });
      db.write();

      const res = await request(app).get("/api/foods").expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: "f1", name: "Chicken" })])
      );
    })
  );

  it(
    "GET /api/foods?search=chi → filtra por nombre (case-insensitive, trim)",
    withTempDb(async () => {
      process.env.NODE_ENV = "test";
      initDb();
      const app = buildApp();

      // Datos
      db.read();
      (db.data!.foods as any[]).push(
        {
          id: "f1",
          name: "Chicken",
          kcal: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          createdAt: new Date().toISOString(),
        },
        {
          id: "f2",
          name: "Rice",
          kcal: 130,
          protein: 2.4,
          carbs: 28,
          fat: 0.3,
          createdAt: new Date().toISOString(),
        }
      );
      db.write();

      const res = await request(app)
        .get("/api/foods")
        .query({ search: " chI " })
        .expect(200);

      // Esperamos solo Chicken
      expect(res.body).toEqual([
        {
          id: "f1",
          name: "Chicken",
          kcal: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          createdAt: expect.any(String),
        },
      ]);
    })
  );

  it(
    "GET /api/foods/:id inexistente → 404",
    withTempDb(async () => {
      process.env.NODE_ENV = "test";
      initDb();
      const app = buildApp();

      const res = await request(app).get("/api/foods/nope").expect(404);
      // El mensaje exacto puede variar; validamos shape genérico
      expect(res.body).toHaveProperty("error");
    })
  );

  it(
    "GET /api/foods/:id existente → 200 con el item",
    withTempDb(async () => {
      process.env.NODE_ENV = "test";
      initDb();
      const app = buildApp();

      db.read();
      (db.data!.foods as any[]).push({
        id: "f1",
        name: "Chicken",
        kcal: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        createdAt: new Date().toISOString(),
      });
      db.write();

      const res = await request(app).get("/api/foods/f1").expect(200);
      expect(res.body).toEqual(
        expect.objectContaining({ id: "f1", name: "Chicken" })
      );
    })
  );
});