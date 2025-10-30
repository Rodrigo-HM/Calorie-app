import request from "supertest";
import { withTempDb } from "../../helpers/withTempDb";

describe("WeightLogs routes (integration HTTP)", () => {
  it(
    "GET sin rango",
    withTempDb(async ({ requireModule }) => {
      process.env.NODE_ENV = "test";
      process.env.AUTH_DISABLED = "true";

      const { buildApp } = requireModule<typeof import("src/module/shared/infrastructure/http/express/AppBuilder")>(
        "src/module/shared/infrastructure/http/express/appBuilder"
      );
      const { db, initDb } = requireModule<typeof import("src/module/shared/infrastructure/db/database")>(
        "src/module/shared/infrastructure/db/database"
      );

      initDb();
      const app = buildApp();

      db.read();
      db.data!.weightLogs = [];
      (db.data!.weightLogs as any[]).push(
        { id: "w1", userId: "u1", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 79, createdAt: "now" },
        { id: "w2", userId: "u2", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 82, createdAt: "now" },
      );
      db.write();

      const res = await request(app).get("/api/users/me/weight-logs").expect(200);
      expect(res.body.map((w: any) => w.id)).toEqual(["w1"]);
    })
  );

  it(
    "POST YYYY-MM-DD normaliza a ISO",
    withTempDb(async ({ requireModule }) => {
      process.env.NODE_ENV = "test";
      process.env.AUTH_DISABLED = "true";
      const { buildApp } = requireModule("src/module/shared/infrastructure/http/express/appBuilder");
      const { initDb } = requireModule("src/module/shared/infrastructure/db/database");
      initDb();
      const app = buildApp();

      const res = await request(app)
        .post("/api/users/me/weight-logs")
        .send({ date: "2025-10-20", weightKg: 80, bodyFat: 15 })
        .expect(201);

      expect(res.body.dateISO).toBe("2025-10-20T00:00:00.000Z");
    })
  );
});