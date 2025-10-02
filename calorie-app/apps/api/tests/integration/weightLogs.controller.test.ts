import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { bootstrap, goalsApi } from "../utils";

let app: import("express").Express;

beforeEach(async () => {
app = await bootstrap();
});

describe("WeightLogController", () => {
it("GET /api/users/me/weight-logs sin datos -> []", async () => {
const res = await request(app).get("/api/users/me/weight-logs").expect(200);
expect(Array.isArray(res.body)).toBe(true);
expect(res.body.length).toBe(0);
});

it("POST crea un weight log válido -> 201 y GET lo devuelve", async () => {
const create = await request(app)
.post("/api/users/me/weight-logs")
.send({ date: "2025-10-01", weightKg: 72.3, bodyFat: 18.5 })
.expect(201);

expect(create.body).toMatchObject({
  userId: "test-user",
  date: "2025-10-01",
  weightKg: 72.3,
  bodyFat: 18.5,
});
expect(create.body.id).toBeDefined();

const list = await request(app).get("/api/users/me/weight-logs").expect(200);
expect(list.body).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ id: create.body.id, weightKg: 72.3, bodyFat: 18.5 }),
  ])
);
});

it("POST valida weightKg y bodyFat -> 400 en inválidos", async () => {
// weightKg inválido
await request(app)
.post("/api/users/me/weight-logs")
.send({ date: "2025-10-01", weightKg: 0 })
.expect(400);

await request(app)
  .post("/api/users/me/weight-logs")
  .send({ date: "2025-10-01", weightKg: -5 })
  .expect(400);

await request(app)
  .post("/api/users/me/weight-logs")
  .send({ date: "2025-10-01", weightKg: "70" as any })
  .expect(400);

// bodyFat inválido
await request(app)
  .post("/api/users/me/weight-logs")
  .send({ date: "2025-10-01", weightKg: 70, bodyFat: -1 })
  .expect(400);

await request(app)
  .post("/api/users/me/weight-logs")
  .send({ date: "2025-10-01", weightKg: 70, bodyFat: 61 })
  .expect(400);

await request(app)
  .post("/api/users/me/weight-logs")
  .send({ date: "2025-10-01", weightKg: 70, bodyFat: "x" as any })
  .expect(400);
});

it("GET con rango from/to filtra correctamente", async () => {
// Crea varios registros en distintas fechas
const dates = ["2025-09-29", "2025-10-01", "2025-10-05"];
for (const [i, d] of dates.entries()) {
await request(app)
.post("/api/users/me/weight-logs")
.send({ date: d, weightKg: 70 + i })
.expect(201);
}

// Filtro del 30 Sep al 2 Oct -> solo debe incluir 2025-10-01
const res = await request(app)
  .get("/api/users/me/weight-logs")
  .query({ from: "2025-09-30", to: "2025-10-02" })
  .expect(200);

const ds = res.body.map((x: any) => x.date);
expect(ds).toEqual(["2025-10-01"]);
});

it("Aislamiento por usuario: A no ve datos de B", async () => {
// Usuario A (bypass test) crea logs
await request(app)
.post("/api/users/me/weight-logs")
.send({ date: "2025-10-01", weightKg: 72 })
.expect(201);

// Usuario B con otro token
const tokenB = jwt.sign({ sub: "user-b" }, process.env.JWT_SECRET || "dev_secret_change_me");

// B lista sus logs -> vacío
const listB = await request(app)
  .get("/api/users/me/weight-logs")
  .set("Authorization", `Bearer ${tokenB}`)
  .expect(200);

expect(listB.body).toEqual([]);

// B crea su propio log
await request(app)
  .post("/api/users/me/weight-logs")
  .set("Authorization", `Bearer ${tokenB}`)
  .send({ date: "2025-10-02", weightKg: 75 })
  .expect(201);

// A sigue viendo solo los suyos
const listA = await request(app)
  .get("/api/users/me/weight-logs")
  .set("Authorization", "Bearer test")
  .expect(200);

expect(listA.body).toEqual(
  expect.arrayContaining([expect.objectContaining({ date: "2025-10-01", weightKg: 72 })])
);
// y no debe incluir el de B
for (const item of listA.body) {
  expect(item.userId).toBe("test-user");
}
});
});