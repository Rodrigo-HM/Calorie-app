import request from "supertest";
import { buildApp } from "../../../src/module/shared/infrastructure/http/express/AppBuilder";

describe("Foods HTTP", () => {
  it("GET /api/foods devuelve lista", async () => {
    const app = buildApp();
    const res = await request(app).get("/api/foods").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/foods/:id inexistente → 404", async () => {
    const app = buildApp();
    await request(app).get("/api/foods/__nope__").expect(404);
  });
});
