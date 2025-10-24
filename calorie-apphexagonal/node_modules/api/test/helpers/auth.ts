import request from "supertest";
import type { Express } from "express";

export async function registerAndLogin(
  app: Express
): Promise<{ token: string; email: string; password: string }> {
  const email = `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.dev`;
  const password = "Secret123!";

  await request(app)
    .post("/api/auth/register")
    .send({ email, password })
    .expect(201);

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email, password })
    .expect(200);

  return { token: login.body.token as string, email, password };
}
