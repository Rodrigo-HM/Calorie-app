import request from "supertest";
import { withTempDb } from "../../helpers/withTempDb";
import { buildApp } from "src/module/shared/infrastructure/http/express/AppBuilder";
import { initDb, seedFoodsIfEmpty, migrateEntriesDateToDateISO } from "src/module/shared/infrastructure/db/database";

describe("Entries routes (integration HTTP)", () => {
  it("POST normaliza YYYY-MM-DD a ISO y GET devuelve items + totals", withTempDb(async () => {
    process.env.NODE_ENV = "test"; // si tu app usa esto para desactivar auth
    initDb(); seedFoodsIfEmpty(); migrateEntriesDateToDateISO();
    const app = buildApp();

    // 1) Obtenemos un food válido
    const foodsRes = await request(app).get("/api/foods").expect(200);
    const food = foodsRes.body[0];

    // 2) Creamos entry con día (no hora)
    const createRes = await request(app)
      .post("/api/entries")
      .send({ foodId: food.id, grams: 100, date: "2025-10-21" })
      .expect(201);

    expect(createRes.body.date).toBe("2025-10-21T00:00:00.000Z");

    // 3) Listamos por día
    const listRes = await request(app)
      .get("/api/entries")
      .query({ date: "2025-10-21" })
      .expect(200);

    expect(Array.isArray(listRes.body.items)).toBe(true);
    expect(listRes.body.items[0].date).toBe("2025-10-21T00:00:00.000Z");
    expect(listRes.body).toHaveProperty("totals");
  }));
});