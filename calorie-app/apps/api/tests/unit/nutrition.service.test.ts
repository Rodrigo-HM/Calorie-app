import { describe, it, expect } from "vitest";
import { calcGoalsFromProfile } from "../../src/services/nutrition.service";

describe("calcGoalsFromProfile", () => {
  const activities = ["sedentary", "light", "moderate", "active", "veryActive"] as const;

  it("calcula macros básicos sin bodyFat", () => {
    const profile = {
      sex: "male" as const,
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activity: "moderate" as const,
      goal: "maintain" as const,
    };

    const result = calcGoalsFromProfile(profile);

    expect(result.protein).toBe(160); // 2*80
    expect(result.fat).toBe(72);      // 0.9*80
    expect(result.carbs).toBeGreaterThanOrEqual(0);
    expect(result.calories).toBeGreaterThan(0);
  });

  it("calcula usando Katch-McArdle si bodyFat definido", () => {
    const profile = {
      sex: "female" as const,
      age: 25,
      heightCm: 165,
      weightKg: 60,
      bodyFat: 25,
      activity: "light" as const,
      goal: "maintain" as const,
    };

    const result = calcGoalsFromProfile(profile);

    expect(result.protein).toBe(120); // 2*60
    expect(result.fat).toBe(54);      // 0.9*60
    expect(result.carbs).toBeGreaterThanOrEqual(0);
    expect(result.calories).toBeGreaterThan(0);
  });

  it("aplica ajuste de goal correctamente", () => {
    const baseProfile = {
      sex: "male" as const,
      age: 28,
      heightCm: 175,
      weightKg: 70,
      activity: "sedentary" as const,
    };

    const maintain = calcGoalsFromProfile({ ...baseProfile, goal: "maintain" });
    const cut = calcGoalsFromProfile({ ...baseProfile, goal: "cut" });
    const bulk = calcGoalsFromProfile({ ...baseProfile, goal: "bulk" });

    expect(cut.calories).toBe(maintain.calories - 500);
    expect(bulk.calories).toBe(maintain.calories + 500);
  });

  it("asegura mínimo de 1200 kcal", () => {
    const profile = {
      sex: "female" as const,
      age: 80,
      heightCm: 140,
      weightKg: 40,
      activity: "sedentary" as const,
      goal: "cut" as const,
    };

    const result = calcGoalsFromProfile(profile);
    expect(result.calories).toBeGreaterThanOrEqual(1200);
  });

  it("prueba todas las actividades para consistencia", () => {
    const profileBase = {
      sex: "male" as const,
      age: 35,
      heightCm: 175,
      weightKg: 75,
      goal: "maintain" as const,
    };

    for (const activity of activities) {
      const res = calcGoalsFromProfile({ ...profileBase, activity });
      expect(res.calories).toBeGreaterThan(0);
      expect(res.protein).toBe(150); // 2*75
      expect(res.fat).toBe(68);      // 0.9*75
      expect(res.carbs).toBeGreaterThanOrEqual(0);
    }
  });
});
