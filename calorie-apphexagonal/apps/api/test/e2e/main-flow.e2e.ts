import request from "supertest";

const asUser = async (url: string, email: string, password: string) => {
  await request(url).post("/api/auth/register").send({ email, password }).expect(201);
  const login = await request(url).post("/api/auth/login").send({ email, password }).expect(200);
  const token = login.body.token as string;
  return { token };
};

describe("E2E: flujo completo", () => {
  it("register → login → set profile (goals) → entries → weight-logs", async () => {
    const { url } = (global as any).e2e;
    const email = `u_${Date.now()}@e2e.dev`;
    const password = "Secret123!";
    const { token } = await asUser(url, email, password);

    // Foods: se asume que el seed de foods corre en initDb/seedFoodsIfEmpty()
    const foodsRes = await request(url).get("/api/foods").expect(200);
    expect(Array.isArray(foodsRes.body)).toBe(true);
    expect(foodsRes.body.length).toBeGreaterThan(0);
    const food = foodsRes.body[0];

    // Profile: actualizar y que calcule goals
    const profilePatch = {
      name: "E2E User",
      sex: "M",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activity: "moderate",
      goal: "maintain",
    };
    const profileRes = await request(url)
      .put("/api/users/me/profile")
      .set("Authorization", `Bearer ${token}`)
      .send(profilePatch)
      .expect(200);

    expect(profileRes.body.profile.name).toBe("E2E User");
    expect(profileRes.body.goals).toHaveProperty("kcal");
    expect(profileRes.body.goals.calories).toBe(profileRes.body.goals.kcal);

    // Entries: crear una y listar con totales
    const dayISO = "2025-10-20";
    await request(url)
      .post("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({ foodId: food.id, grams: 150, date: `${dayISO}T10:00:00.000Z` })
      .expect(201);

    const entriesList = await request(url)
      .get("/api/entries")
      .set("Authorization", `Bearer ${token}`)
      .query({ date: dayISO })
      .expect(200);

    // Soportar ambos contratos: array plano o { items, totals }
    const body = entriesList.body;
    const items = Array.isArray(body) ? body : body.items;
    const totals = Array.isArray(body) ? null : body.totals;

    expect(items.length).toBeGreaterThan(0);
    if (totals) {
      expect(totals).toHaveProperty("kcal");
      expect(totals).toHaveProperty("protein");
    }

    // Weight logs: crear y listar por rango
    await request(url)
      .post("/api/users/me/weight-logs")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: `${dayISO}T09:00:00.000Z`, weightKg: 80, bodyFat: 15 })
      .expect(201);

    const wl = await request(url)
      .get("/api/users/me/weight-logs")
      .set("Authorization", `Bearer ${token}`)
      .query({ from: "2025-10-15", to: "2025-10-25" })
      .expect(200);

    expect(Array.isArray(wl.body)).toBe(true);
    expect(wl.body.find((x: any) => x.weightKg === 80)).toBeTruthy();
  }, 30_000);
});
