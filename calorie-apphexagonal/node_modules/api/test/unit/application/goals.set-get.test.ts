import { GoalsService } from "../../../src/module/goals/application/GoalsService";
import { makeGoalsRepo } from "../../fakes/goals";

describe("GoalsService (application)", () => {
  it("set normaliza calories→kcal y aplica defaults 0", async () => {
    const repo = makeGoalsRepo(null);
    const svc = new GoalsService(repo);

    const saved = await svc.set("u1", { calories: 2000, protein: 120 });
    expect(saved).toEqual({
      userId: "u1",
      kcal: 2000,
      protein: 120,
      carbs: 0,
      fat: 0,
    });

    const got = await svc.get("u1");
    expect(got).toEqual(saved);
  });

  it("get devuelve null cuando no hay metas", async () => {
    const repo = makeGoalsRepo(null);
    const svc = new GoalsService(repo);

    const out = await svc.get("unknown");
    expect(out).toBeNull();
  });
});
