
import type {
  Goals,
  GoalsInput,
} from "src/module/goals/aplication/ports/GoalsRepository";
import type {
  Profile as DomainProfile,
} from "src/module/profile/aplication/ports/ProfileRepository";
import { calculateGoals } from "../domain/GoalsCalculator";

// Solo los campos que el cálculo necesita (sin userId)
type ProfileForGoals = Pick<
  DomainProfile,
  "sex" | "age" | "heightCm" | "weightKg" | "bodyFat" | "activity" | "goal"
>;

export class RecalculateAndSaveGoals {
  constructor(
    private readonly goalsRepo: {
      set: (userId: string, data: GoalsInput) => Promise<Goals>;
    }
  ) {}

  // Acepta un Profile completo (con userId) o un ProfileForGoals (sin userId)
  async run(userId: string, profile: DomainProfile | ProfileForGoals): Promise<Goals> {
    const computed: GoalsInput = calculateGoals({
      // Defaults defensivos por si faltan campos en el objeto recibido
      sex: (profile as any).sex ?? "M",
      age: (profile as any).age ?? 30,
      heightCm: (profile as any).heightCm ?? 170,
      weightKg: (profile as any).weightKg ?? 70,
      bodyFat: (profile as any).bodyFat,
      activity: (profile as any).activity ?? "sedentary",
      goal: (profile as any).goal ?? "maintain",
    });

    // El repo añade userId y persiste; devuelve Goals (con userId)
    return this.goalsRepo.set(userId, computed);
  }
}