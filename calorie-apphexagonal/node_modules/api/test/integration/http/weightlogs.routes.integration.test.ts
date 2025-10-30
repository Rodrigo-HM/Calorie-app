import request from "supertest";
import { withTempDb } from "../../helpers/withTempDb";
import { buildApp } from "../../../src/module/shared/infrastructure/http/express/AppBuilder";
import {
  initDb,
  seedFoodsIfEmpty,
  migrateEntriesDateToDateISO,
  db,
} from "../../../src/module/shared/infrastructure/db/database";

describe("WeightLogs routes (integration HTTP)", () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  it(
    "GET /api/users/me/weight-logs → lista sin rango",
    withTempDb(async () => {
      process.env.NODE_ENV = "test"; // modo sin auth real si lo usas
      initDb(); seedFoodsIfEmpty(); migrateEntriesDateToDateISO();
      const app = buildApp();

      // Datos deterministas directamente en DB temporal
      db.read();
      (db.data!.weightLogs as any[]).push(
        { id: "w1", userId: "u1", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 79, createdAt: "now" },
        { id: "w2", userId: "u2", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 82, createdAt: "now" },
      );
      db.write();

      const res = await request(app).get("/api/users/me/weight-logs").expect(200);
      expect(res.body).toEqual([
        { id: "w1", userId: "u1", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 79, createdAt: "now" },
      ]);
    })
  );

  it(
    "GET /api/users/me/weight-logs?from&to → filtra rango inclusivo (YYYY-MM-DD)",
    withTempDb(async () => {
      process.env.NODE_ENV = "test";
      initDb(); seedFoodsIfEmpty(); migrateEntriesDateToDateISO();
      const app = buildApp();

      db.read();
      (db.data!.weightLogs as any[]).push(
        { id: "w1", userId: "u1", dateISO: "2025-10-10T00:00:00.000Z", weightKg: 80, createdAt: "now" },
        { id: "w2", userId: "u1", dateISO: "2025-10-20T00:00:00.000Z", weightKg: 79, createdAt: "now" },
        { id: "w3", userId: "u1", dateISO: "2025-10-30T00:00:00.000Z", weightKg: 78, createdAt: "now" },
        { id: "w4", userId: "u1", dateISO: "2025-11-01T00:00:00.000Z", weightKg: 77, createdAt: "now" },
      );
      db.write();

      const res = await request(app)
        .get("/api/users/me/weight-logs")
        .query({ from: "2025-10-20", to: "2025-10-30" })
        .expect(200);

      expect(res.body.map((w: any) => w.id)).toEqual(["w2", "w3"]);
    })
  );

  it(
    "POST con fecha YYYY-MM-DD → normaliza a ISO T00:00:00.000Z",
    withTempDb(async () => {
      process.env.NODE_ENV = "test";
      initDb(); seedFoodsIfEmpty(); migrateEntriesDateToDateISO();
      const app = buildApp();

      const res = await request(app)
        .post("/api/users/me/weight-logs")
        .send({ date: "2025-10-20", weightKg: 80, bodyFat: 15 })
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          userId: "u1",
          dateISO: "2025-10-20T00:00:00.000Z",
          weightKg: 80,
          bodyFat: 15,
        })
      );
    })
  );

  it(
    "POST sin fecha → usa ahora (reloj fijo)",
    withTempDb(async () => {
      process.env.NODE_ENV = "test";
      // Fijamos el reloj ANTES de construir la app
      const fixed = new Date("2025-10-20T12:34:56.000Z");
      jest.useFakeTimers().setSystemTime(fixed);

      initDb(); seedFoodsIfEmpty(); migrateEntriesDateToDateISO();
      const app = buildApp();

      const res = await request(app)
        .post("/api/users/me/weight-logs")
        .send({ weightKg: 81 })
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          userId: "u1",
          dateISO: fixed.toISOString(),
          weightKg: 81,
        })
      );
    })
  );

  it(
    "POST valida weightKg y bodyFat (Zod) → 400 en casos inválidos",
    withTempDb(async () => {
      process.env.NODE_ENV = "test";
      initDb(); seedFoodsIfEmpty(); migrateEntriesDateToDateISO();
      const app = buildApp();

      // weightKg <= 0
      await request(app)
        .post("/api/users/me/weight-logs")
        .send({ weightKg: -1 })
        .expect(400);

      // bodyFat > 60
      await request(app)
        .post("/api/users/me/weight-logs")
        .send({ weightKg: 80, bodyFat: 80 })
        .expect(400);
    })
  );
});