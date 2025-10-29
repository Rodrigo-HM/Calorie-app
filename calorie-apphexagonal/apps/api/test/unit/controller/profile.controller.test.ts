import { ProfileController } from "../../../src/module/profile/infrastructure/http/express/ProfileController";
import { calculateGoals } from "../../../src/module/profile/domain/GoalsCalculator";

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makeProfileRepo(initial: any | null = null) {
  let store = initial;
  return {
    async get(userId: string) {
      return store && store.userId === userId ? store : null;
    },
    async update(userId: string, patch: any) {
      store = { ...(store ?? { userId }), ...patch, userId };
      return store;
    },
    __peek: () => store,
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

    // stubs de casos de uso no usados en GET
    const updateProfile = {
      run: async () => {
        throw new Error("not used in GET");
      },
    };
    const recalcGoals = {
      run: async () => {
        throw new Error("not used in GET");
      },
    };

    const ctl = new ProfileController(
      updateProfile as any,
      recalcGoals as any,
      profileRepo as any
    );
    const req = { user: { id: "u1" } } as any;
    const res = mockRes();

    await ctl.get(req, res);
    expect(res.json).toHaveBeenCalledWith(null);
  });

  it("PUT /api/users/me/profile → guarda perfil, calcula metas, persiste goals y responde { profile, goals+calories }", async () => {
    const profileRepo = makeProfileRepo(null);
    const goalsRepo = makeGoalsRepoSpy();

    const updateProfile = {
      run: (userId: string, patch: any) => profileRepo.update(userId, patch),
    };

    const recalcGoals = {
      run: async (userId: string, profile: any) => {
        const goals = calculateGoals({
          sex: profile.sex,
          age: profile.age,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
          bodyFat: profile.bodyFat,
          activity: profile.activity,
          goal: profile.goal,
        });
        await goalsRepo.set(userId, goals);
        return goals;
      },
    };

    const ctl = new ProfileController(
      updateProfile as any,
      recalcGoals as any,
      profileRepo as any
    );

    const req = {
      user: { id: "u1" },
      body: {
        name: "Rodrigo",
        sex: "M",
        age: 30,
        heightCm: 180,
        weightKg: 80,
        bodyFat: 15,
        activity: "moderate",
        goal: "maintain",
      },
    } as any;
    const res = mockRes();

    await ctl.update(req, res);

    const payload = res.json.mock.calls[0][0];

    expect(payload.profile.userId).toBe("u1");
    expect(payload.profile.name).toBe("Rodrigo");
    expect(payload.goals).toHaveProperty("kcal");
    expect(payload.goals.calories).toBe(payload.goals.kcal);
    expect(goalsRepo.__calls.length).toBe(1);
  });
});
