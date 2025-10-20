import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { bootstrap, goalsApi } from "../utils";

let app: import("express").Express;

beforeEach(async () => {
  vi.useRealTimers(); // esto lo puedes mantener igual
  app = await bootstrap("/api"); // 👈 ya no repites todo el bloque
});

// Perfil
it("PUT /api/users/me/profile guarda y devuelve metas", async () => {
  const payload = {
    sex: "male",
    age: 28,
    heightCm: 175,
    weightKg: 70,
    activity: "moderate",
    goal: "maintain",
  };
  const res = await request(app).put("/api/users/me/profile").send(payload);
  expect(res.status).toBe(200);
  expect(res.body.profile.userId).toBe("test-user");

  const res2 = await request(app).get("/api/users/me/profile");
  expect(res2.status).toBe(200);
  expect(res2.body.age).toBe(28);
});

// Entries: auth bypass (sin token)
it("GET /api/entries sin token en test -> 200", async () => {
  const res = await request(app).get("/api/entries");
  expect(res.status).toBe(200);
});

