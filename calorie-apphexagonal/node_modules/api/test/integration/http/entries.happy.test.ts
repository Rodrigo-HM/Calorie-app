import request from "supertest";
import { buildApp } from "../../../src/module/shared/infrastructure/http/express/AppBuilder";

async function registerAndLogin(app: any) {
  const email = `u_${Date.now()}@test.dev`;
  const password = "Secret123!";
  await request(app).post("/api/auth/register").send({ email, password }).expect(201);
  const login = await request(app).post("/api/auth/login").send({ email, password }).expect(200);
  return login.body.token as string;
}

const round1 = (n: number) => Number(n.toFixed(1));

describe("Given a logged user and available foods, When creating entries, Then listing returns items and correct totals", () => {
  it("crea entry y lista con totales (kcal/macros) correctos (si el endpoint los devuelve)", async () => {
    // Arrange
    const app = buildApp();
    const token = await registerAndLogin(app);

    // 1) Obtener un food real del backend (usamos los foods del mock de lowdb)
    const foodsRes = await request(app).get("/api/foods").expect(200);
    const foods: Array<{ id: string; kcal: number; protein: number; carbs: number; fat: number; name: string }> =
      foodsRes.body;
    expect(foods.length).toBeGreaterThan(0);

    const food = foods[0];
    const grams = 150; // factor 1.5
    const dateISO = "2025-10-20T10:00:00.000Z";
    const day = "2025-10-20";

    // 2) Crear una entry para ese día
    await request(app)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ foodId: food.id, grams, date: dateISO })
      .expect(201);

    // 3) Listar entries por día
    const listRes = await request(app)
      .get("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .query({ date: day })
      .expect(200);

    const body = listRes.body;

    // Tolerancia de shape: array plano o { items, totals }
    let items: Array<{ id: string; foodId: string; grams: number }> = [];
    let totals: { kcal: number; protein: number; carbs: number; fat: number } | undefined;

    if (Array.isArray(body)) {
      items = body;
    } else if (body && Array.isArray(body.items)) {
      items = body.items;
      totals = body.totals;
    } else if (body && Array.isArray(body.data)) {
      // fallback por si algún controller envuelve en data
      items = body.data;
    } else {
      // Si cambia el contrato, mostramos el body para depurar
      // eslint-disable-next-line no-console
      console.error("Unexpected entries response shape:", body);
      throw new Error("Unexpected entries response shape");
    }

    expect(items.length).toBeGreaterThanOrEqual(1);
    const created = items.find((e) => e.foodId === food.id && e.grams === grams);
    expect(created).toBeTruthy();

    // Si el endpoint devuelve totals, los validamos
    if (totals) {
      const factor = grams / 100;
      const exp = {
        kcal: Math.round(food.kcal * factor),
        protein: round1(food.protein * factor),
        carbs: round1(food.carbs * factor),
        fat: round1(food.fat * factor),
      };

      expect(Math.round(totals.kcal)).toBe(exp.kcal);
      expect(round1(totals.protein)).toBe(exp.protein);
      expect(round1(totals.carbs)).toBe(exp.carbs);
      expect(round1(totals.fat)).toBe(exp.fat);
    }
  });
});
