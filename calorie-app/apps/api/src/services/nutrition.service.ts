import type { Activity, GoalKind, Profile } from "../models/profile.model";
const activityFactor: Record<Activity, number> = {
sedentary: 1.2,
light: 1.375,
moderate: 1.55,
active: 1.725,
veryActive: 1.9,
};

export function calcGoalsFromProfile(p: {
    sex: "male" | "female";
    age: number;
    heightCm: number;
    weightKg: number;
    bodyFat?: number;
    activity: Activity;
    goal: GoalKind;
}) {
    let tmb: number;
    if (typeof p.bodyFat === "number") {
        const lbm = p.weightKg * (1 - p.bodyFat / 100);
        tmb = 370 + 21.6 * lbm; // Katch-McArdle
    } else {
        tmb = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === "male" ? 5 : -161); // Mifflin
    }
    const maintenance = tmb * activityFactor[p.activity];
    const adjust = p.goal === "cut" ? -500 : p.goal === "bulk" ? 500 : 0;
    const calories = Math.max(1200, Math.round(maintenance + adjust));

    // Macros base
    const proteinG = Math.round(2.0 * p.weightKg);
    const fatG = Math.round(0.9 * p.weightKg);
    const carbsG = Math.max(0, Math.round((calories - (proteinG * 4 + fatG * 9)) / 4));

    return { calories, protein: proteinG, carbs: carbsG, fat: fatG };
    }