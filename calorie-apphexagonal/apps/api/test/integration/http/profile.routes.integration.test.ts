import request from "supertest";
import { withTempDb } from "../../helpers/withTempDb";
import { buildApp } from "src/module/shared/infrastructure/http/express/AppBuilder";
import { initDb } from "src/module/shared/infrastructure/db/database";

describe("Profile routes (integration HTTP)", () => {
  it("PATCH profile recalcula y persiste goals", withTempDb(async () => {
    process.env.NODE_ENV = "test";
    initDb();
    const app = buildApp();

    const patch = { sex: "M", age: 30, heightCm: 180, weightKg: 80, activity: "moderate", goal: "maintain" };
    const res = await request(app).put("/api/users/me/profile").send(patch).expect(200);

    expect(res.body.profile.sex).toBe("M");
    expect(res.body.goals).toHaveProperty("kcal");
    expect(res.body.goals).toHaveProperty("calories");
  }));
});