export type Activity = "sedentary" | "light" | "moderate" | "active" | "veryActive";
export type GoalKind = "cut" | "maintain" | "bulk";

export function calculateGoals(input: {
  sex: "M" | "F";
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFat?: number; // %
  activity: Activity;
  goal: GoalKind;
}) {
  const { sex, age, heightCm, weightKg, bodyFat, activity, goal } = input;

  // 1) BMR: Katch–McArdle si hay %grasa, si no Mifflin–St Jeor
  const hasBf = typeof bodyFat === "number" && bodyFat >= 0 && bodyFat <= 60;
  const lbm = hasBf ? weightKg * (1 - bodyFat / 100) : null;

  const bmr = hasBf
    ? 370 + 21.6 * (lbm as number) // Katch–McArdle
    : sex === "M"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5 // Mifflin–St Jeor hombre
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161; // Mifflin–St Jeor mujer

  // 2) Actividad → TDEE
  const activityFactor: Record<Activity, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };
  const tdee = bmr * activityFactor[activity];

  // 3) Ajuste por objetivo
  let kcal = tdee;
  if (goal === "cut") kcal -= Math.max(300, tdee * 0.15); // déficit ~15% (mín. 300)
  if (goal === "bulk") kcal += Math.max(250, tdee * 0.1); // superávit ~10% (mín. 250)
  kcal = Math.round(kcal);

  // 4) Proteína (g): si hay BF → por LBM; si no → por peso total
  const proteinPerKg = hasBf ? 2.0 : 1.8;
  const protein = Math.round((hasBf ? (lbm as number) : weightKg) * proteinPerKg);

  // 5) Grasas (g)
  const fat = Math.round(weightKg * 0.8);

  // 6) Carbohidratos (g)
  const kcalUsed = protein * 4 + fat * 9;
  const carbs = Math.max(Math.round((kcal - kcalUsed) / 4), 0);

  return { kcal, protein, carbs, fat };
}
