import request from "supertest";
import { buildApp } from "../../../src/module/shared/infrastructure/http/express/AppBuilder";

async function registerAndLogin(app: any) {
  const email = `u_${Date.now()}@test.dev`;
  const password = "Secret123!";

  await request(app)
    .post("/api/auth/register")
    .send({ email, password })
    .expect(201);

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email, password })
    .expect(200);

  return login.body.token as string;
}

describe("Goals HTTP (integration)", () => {
  it("GET devuelve { kcal, ..., calories } como alias", async () => {
    const app = buildApp();
    const token = await registerAndLogin(app);

    await request(app)
      .put("/api/users/me/goals")
      .set("Authorization", `Bearer ${token}`)
      .send({ kcal: 2000, protein: 120, carbs: 200, fat: 70 })
      .expect(200);

    const res = await request(app)
      .get("/api/users/me/goals")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.kcal).toBe(2000);
    expect(res.body.calories).toBe(2000);
  });
});
