import type { Request, Response, NextFunction } from "express";
import { calculateGoals } from "../../../src/module/profile/domain/GoalsCalculator"; 
import { ProfileController } from "src/module/profile/infrastructure/http/express/ProfileController";

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock };
}

function makeProfileRepo(initial: any | null = null) {
  let store = initial;
  return {
    async get(userId: string) {
      return store && store.userId === userId ? store : null;
    },
    async update(userId: string, patch: any) {
      store = { ...(store ?? { userId }), ...patch };
      return store;
    },
    __peek: () => store, // expositor para inspeccionar el estado si lo necesitas
  };
}

function makeGoalsRepoSpy() {
  const calls: any[] = [];
  return {
    async set(userId: string, data: any) {
      calls.push({ userId, data });
      return { userId, ...data };
    },
    __calls: calls,
  };
}

describe("ProfileController", () => {
  it("GET /api/users/me/profile → null si no hay perfil", async () => {
    const profileRepo = makeProfileRepo(null);
    const goalsRepo = makeGoalsRepoSpy();

    const controller = new ProfileController(profileRepo as any, goalsRepo as any);
    const req = { user: { id: "u1" } } as any as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    await controller.get(req, res);

    expect(res.json).toHaveBeenCalledWith(null);
    expect(goalsRepo.__calls.length).toBe(0);
  });

  it("PUT /api/users/me/profile → guarda perfil, calcula metas, persiste goals y responde { profile, goals+calories }", async () => {
    const profileRepo = makeProfileRepo(null);
    const goalsRepo = makeGoalsRepoSpy();
    const controller = new ProfileController(profileRepo as any, goalsRepo as any);

    const req = {
      user: { id: "u1" },
      body: {
        sex: "M",
        age: 30,
        heightCm: 180,
        weightKg: 80,
        bodyFat: 15,
        activity: "moderate",
        goal: "maintain",
        name: "Rodrigo",
      },
    } as any as Request;

    const res = mockRes();
    const next = jest.fn() as NextFunction;

    // Act
    await controller.update(req, res);

    // Assert respuesta HTTP
    expect(res.json).toHaveBeenCalledTimes(1);
    const payload = res.json.mock.calls[0][0] as any;

    // 1) Respuesta: profile devuelto refleja el patch
    expect(payload.profile.userId).toBe("u1");
    expect(payload.profile.name).toBe("Rodrigo");
    expect(payload.profile.age).toBe(30);

    // 2) goals calculados + alias calories
    expect(payload.goals).toHaveProperty("kcal");
    expect(payload.goals).toHaveProperty("protein");
    expect(payload.goals).toHaveProperty("carbs");
    expect(payload.goals).toHaveProperty("fat");
    expect(payload.goals.calories).toBe(payload.goals.kcal);

    // 3) Verifica que goalsRepo.set fue llamado con lo calculado
    expect(goalsRepo.__calls.length).toBe(1);
    expect(goalsRepo.__calls[0].userId).toBe("u1");
    expect(goalsRepo.__calls[0].data).toMatchObject({
      kcal: payload.goals.kcal,
      protein: payload.goals.protein,
      carbs: payload.goals.carbs,
      fat: payload.goals.fat,
    });
  });
});
