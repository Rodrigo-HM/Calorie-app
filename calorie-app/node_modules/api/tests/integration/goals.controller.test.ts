import { describe, it, expect, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { bootstrap, goalsApi } from "../utils";

let app: import("express").Express;
let goals: ReturnType<typeof goalsApi>;

beforeEach(async () => {
  app = await bootstrap();
  goals = goalsApi(app);
});

describe("GoalsController", () => {
  it("GET /api/users/me/goals sin metas previas -> null", async () => {
    const res = await goals.get();
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it("PUT /api/users/me/goals crea metas válidas y GET las devuelve", async () => {
    const payload = { calories: 2200, protein: 140, carbs: 230, fat: 70 };

    const put = await goals.put(payload);
    expect(put.status).toBe(200);
    expect(put.body).toMatchObject({
      ...payload,
      userId: "test-user",
    });

    const get = await goals.get();
    expect(get.status).toBe(200);
    expect(get.body).toMatchObject({
      ...payload,
      userId: "test-user",
    });
  });

  it("PUT /api/users/me/goals requiere calories entero > 0 -> 400", async () => {
    await goals.put({}).expect(400);
    await goals.put({ calories: 0 }).expect(400);
    await goals.put({ calories: 2000.5 }).expect(400);
    await goals.put({ calories: -100 }).expect(400);
  });

  it("PUT valida opcionales protein/carbs/fat (enteros >= 0)", async () => {
    await goals.put({ calories: 2000 }).expect(200);

    await goals.put({ calories: 2000, protein: -1 }).expect(400);
    await goals.put({ calories: 2000, carbs: 10.5 }).expect(400);
    await goals.put({ calories: 2000, fat: "x" as any }).expect(400);
  });

  it("Aislamiento por usuario: metas de A no se ven/actualizan por B", async () => {
    // Usuario A
    await goals.put({ calories: 2100, protein: 120 }).expect(200);

    // Usuario B con token distinto
    const tokenUserB = jwt.sign(
      { sub: "user-b" },
      process.env.JWT_SECRET || "dev_secret_change_me"
    );
    const goalsB = goalsApi(app, tokenUserB);

    const getB = await goalsB.get();
    expect(getB.body).toBeNull();

    const putB = await goalsB.put({ calories: 2500, carbs: 300 });
    expect(putB.body).toMatchObject({ userId: "user-b", calories: 2500, carbs: 300 });

    const getA = await goals.get();
    expect(getA.body).toMatchObject({ userId: "test-user", calories: 2100, protein: 120 });
  });
});
