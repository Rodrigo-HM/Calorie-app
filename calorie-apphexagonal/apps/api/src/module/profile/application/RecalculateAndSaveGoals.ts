import { calculateGoals } from "../domain/GoalsCalculator";
import type { Goals, GoalsInput } from "src/module/goals/domain/GoalsRepository";
import type { Profile, Activity, GoalKind, Sex } from "../domain/ProfileRepository";

// Solo los campos necesarios para el cálculo (sin userId)
type ProfileForGoals = Pick<Profile, "sex" | "age" | "heightCm" | "weightKg" | "bodyFat" | "activity" | "goal">;

export class RecalculateAndSaveGoals {
  constructor(
    private readonly goalsRepo: {
      set: (userId: string, data: GoalsInput) => Promise<Goals>;
    }
  ) {}

  async run(userId: string, profile: Profile | ProfileForGoals): Promise<Goals> {
    const computed: GoalsInput = calculateGoals({
      sex: (profile.sex ?? "M") as Sex,
      age: profile.age ?? 30,
      heightCm: profile.heightCm ?? 170,
      weightKg: profile.weightKg ?? 70,
      bodyFat: profile.bodyFat,
      activity: (profile.activity ?? "sedentary") as Activity,
      goal: (profile.goal ?? "maintain") as GoalKind,
    });

    return this.goalsRepo.set(userId, computed);
  }
}