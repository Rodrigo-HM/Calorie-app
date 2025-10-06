import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { bootstrap, authApi, entriesApi, foodsApi, goalsApi } from "../utils";

let app: import("express").Express;

beforeEach(async () => {
  app = await bootstrap();
});

describe("E2E API", () => {
  it("flujo completo: registrar, login, crear entry, listar, metas", async () => {
    // 1️⃣ Registro de usuario
    const auth = authApi(app);
    const reg = await auth.register({ email: "e2e@test.com", password: "123Abc!" });
    expect(reg.status).toBe(201);

    // 2️⃣ Login
    const login = await auth.login({ email: "e2e@test.com", password: "123Abc!" });
    expect(login.status).toBe(200);
    const token = login.body.token;

    // 3️⃣ Listar foods
    const foods = await foodsApi(app).list();
    expect(foods.status).toBe(200);
    expect(Array.isArray(foods.body)).toBe(true);
    const foodId = foods.body[0].id;

    // 4️⃣ Crear una entry
    const entries = entriesApi(app, token);
    const createdEntry = await entries.create({ foodId, grams: 150 });
    expect(createdEntry.status).toBe(201);

    // 5️⃣ Listar entries
    const list = await entries.list();
    expect(list.status).toBe(200);
    expect(list.body.items.length).toBeGreaterThan(0);

    // 6️⃣ Crear metas
    const goals = goalsApi(app, token);
    const putGoals = await goals.put({ calories: 2500, protein: 140, carbs: 230, fat: 70 });
    expect(putGoals.status).toBe(200);

    // 7️⃣ Comprobar que GET devuelve las metas
    const getGoals = await goals.get();
    expect(getGoals.status).toBe(200);
    expect(getGoals.body.calories).toBe(2500);
  });
});
