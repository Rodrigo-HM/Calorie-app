import request from "supertest";
import { withTempDb } from "../../helpers/withTempDb";
import { buildApp } from "src/module/shared/infrastructure/http/express/AppBuilder";
import { initDb } from "src/module/shared/infrastructure/db/database";

describe("Goals routes (integration HTTP)", () => {
  it("PUT set y GET devuelve calories alias", withTempDb(async () => {
    process.env.NODE_ENV = "test";
    initDb();
    const app = buildApp();

    await request(app)
      .put("/api/users/me/goals")
      .send({ kcal: 2200, protein: 140, carbs: 240, fat: 70 })
      .expect(200);

    const res = await request(app).get("/api/users/me/goals").expect(200);
    expect(res.body.kcal).toBe(2200);
    expect(res.body.calories).toBe(2200);
  }));
});