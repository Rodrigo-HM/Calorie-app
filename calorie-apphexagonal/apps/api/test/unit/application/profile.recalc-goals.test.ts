import { RecalculateAndSaveGoals } from "src/module/profile/application/RecalculateAndSaveGoals";
import type { Profile } from "src/module/profile/domain/ProfileRepository";


// Solo los campos que usa el cálculo (sin userId)
type ProfileForGoals = Pick<
  Profile,
  "sex" | "age" | "heightCm" | "weightKg" | "bodyFat" | "activity" | "goal"
>;

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

describe("RecalculateAndSaveGoals", () => {
  it("calcula metas y las persiste", async () => {
    const goalsRepo = makeGoalsRepoSpy();
    const uc = new RecalculateAndSaveGoals(goalsRepo as any);

    const profile: ProfileForGoals = {
      sex: "M",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activity: "moderate",
      goal: "maintain",
      bodyFat: 15,
    };

    const out = await uc.run("u1", profile);

    expect(out).toHaveProperty("kcal");
    expect(goalsRepo.__calls.length).toBe(1);
    expect(goalsRepo.__calls[0]).toMatchObject({
      userId: "u1",
      data: expect.objectContaining({ kcal: out.kcal }),
    });
  });
});
