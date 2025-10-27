import { calculateGoals } from "../../../src/module/profile/domain/GoalsCalculator";

describe("calculateGoals (dominio)", () => {
  it("usa Katch–McArdle si hay bodyFat válido", () => {
    const out = calculateGoals({
      sex: "M",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      bodyFat: 15, // activa Katch–McArdle
      activity: "moderate",
      goal: "maintain",
    });

    // Chequeo básico de forma y rangos razonables
    expect(out.kcal).toBeGreaterThan(1500);
    expect(out.protein).toBeGreaterThan(0);
    expect(out.fat).toBeGreaterThan(0);
    expect(out.carbs).toBeGreaterThanOrEqual(0);
  });

  it("usa Mifflin–St Jeor si no hay bodyFat", () => {
    const outM = calculateGoals({
      sex: "M",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activity: "moderate",
      goal: "maintain",
    });

    const outF = calculateGoals({
      sex: "F",
      age: 30,
      heightCm: 165,
      weightKg: 60,
      activity: "moderate",
      goal: "maintain",
    });

    // regla general razonable por diferencias de BMR
    expect(outM.kcal).toBeGreaterThan(outF.kcal);
  });

  it("aplica ajuste de objetivo: cut reduce kcal; bulk aumenta kcal", () => {
    const base = calculateGoals({
      sex: "M",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activity: "moderate",
      goal: "maintain",
    });

    const cut = calculateGoals({
      sex: "M",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activity: "moderate",
      goal: "cut",
    });

    const bulk = calculateGoals({
      sex: "M",
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activity: "moderate",
      goal: "bulk",
    });

    expect(cut.kcal).toBeLessThan(base.kcal);
    expect(bulk.kcal).toBeGreaterThan(base.kcal);
  });
});
