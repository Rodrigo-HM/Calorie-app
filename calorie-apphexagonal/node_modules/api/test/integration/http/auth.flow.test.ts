import request from "supertest"; // Usa ruta relativa para no necesitar moduleNameMapper
import { buildApp } from "../../../src/module/shared/infrastructure/http/express/AppBuilder";

describe("Auth flow (Jest minimal)", () => {
  it("register → login → GET goals", async () => {
    const app = buildApp();
    const email = `u_${Date.now()}@test.dev`;
    const password = "Secret123!";

    // Registro del usuario
    await request(app)
      .post("/api/auth/register")
      .send({ email, password })
      .expect(201);

    // Login del usuario
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password })
      .expect(200);

    const token = login.body.token;

    // Obtener objetivos del usuario
    const res = await request(app)
      .get("/api/users/me/goals")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body === null || typeof res.body === "object").toBe(true);
  });
});
