import request from "supertest";
import { withTempDb } from "../../helpers/withTempDb";

describe("Entries routes (integration HTTP)", () => {
  it(
    "POST normaliza YYYY-MM-DD a ISO y GET devuelve items + totals",
    withTempDb(async ({ requireModule }) => {
      // Carga aislada de módulos usando el DB_PATH temporal
      const { buildApp } = requireModule<typeof import("src/module/shared/infrastructure/http/express/AppBuilder")>(
        "src/module/shared/infrastructure/http/express/appBuilder"
      );
      const { db, initDb } = requireModule<typeof import("src/module/shared/infrastructure/db/database")>(
        "src/module/shared/infrastructure/db/database"
      );

      process.env.NODE_ENV = "test";

      // Inicializa DB (estructura vacía)
      initDb();

      // Construye la app después de tener DB_PATH e initDb
      const app = buildApp();

      // Siembra un food determinista (evita duplicados)
      db.read();
      db.data!.foods = [
        {
          id: "f1",
          name: "Chicken",
          kcal: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          createdAt: new Date().toISOString(),
        },
      ];
      db.write();

      // 1) Crear entry con día (no hora)
      const createRes = await request(app)
        .post("/api/entries")
        .send({ foodId: "f1", grams: 100, date: "2025-10-21" })
        .expect(201);

      expect(createRes.body.date).toBe("2025-10-21T00:00:00.000Z");

      // 2) Listar por día
      const listRes = await request(app)
        .get("/api/entries")
        .query({ date: "2025-10-21" })
        .expect(200);

      expect(Array.isArray(listRes.body.items)).toBe(true);
      expect(listRes.body.items[0].date).toBe("2025-10-21T00:00:00.000Z");
      expect(listRes.body).toHaveProperty("totals");
    })
  );
});