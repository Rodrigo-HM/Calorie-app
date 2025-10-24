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

describe("POST /api/entries (integration)", () => {
  it("400 Datos inválidos si falta foodId o grams <= 0", async () => {
    const app = buildApp();
    const token = await registerAndLogin(app);

    const res = await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ foodId: "", grams: 0 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Datos inválidos");
    expect(res.body.errors).toBeTruthy();
  });
});
