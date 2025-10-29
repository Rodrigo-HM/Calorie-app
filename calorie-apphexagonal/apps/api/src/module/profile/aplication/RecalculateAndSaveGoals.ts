import { calculateGoals } from "../domain/GoalsCalculator";

export class RecalculateAndSaveGoals {
  constructor(
    private readonly goalsRepo: {
      set: (
        userId: string,
        data: {
          kcal: number;
          protein: number;
          carbs: number;
          fat: number;
        }
      ) => Promise<any>;
    }
  ) {}

  async run(userId: string, profile: any) {
    // Calcular los objetivos nutricionales según el perfil del usuario
    const goals = calculateGoals({
      sex: profile.sex,
      age: profile.age,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      bodyFat: profile.bodyFat,
      activity: profile.activity,
      goal: profile.goal,
    });

    // Guardar los nuevos objetivos en el repositorio
    await this.goalsRepo.set(userId, goals);

    // Devolver los objetivos actualizados
    return goals;
  }
}
