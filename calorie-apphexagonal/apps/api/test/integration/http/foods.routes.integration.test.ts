import request from "supertest";
import { withTempDb } from "../../helpers/withTempDb";

describe("Foods routes (integration HTTP)", () => {
  it(
    "GET /api/foods?search=chi filtra",
    withTempDb(async ({ requireModule }) => {
      const { buildApp } = requireModule<typeof import("src/module/shared/infrastructure/http/express/AppBuilder")>(
        "src/module/shared/infrastructure/http/express/appBuilder"
      );
      const { db, initDb } = requireModule<typeof import("src/module/shared/infrastructure/db/database")>(
        "src/module/shared/infrastructure/db/database"
      );

      process.env.NODE_ENV = "test";
      initDb();

      const app = buildApp();

      // Semilla explícita solo para este test (sin llamar a seedFoodsIfEmpty para evitar duplicados)
      db.read();
      db.data!.foods = [];
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

      const res = await request(app).get("/api/foods").query({ search: " chI " }).expect(200);
      expect(res.body).toEqual([
        expect.objectContaining({ id: "f1", name: "Chicken" }),
      ]);
    })
  );
});