export type Goals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type GoalsInput = Partial<Goals>;

export function ensureGoals(input: GoalsInput): Goals {
  const base: Goals = {
    kcal: input.kcal ?? 0,
    protein: input.protein ?? 0,
    carbs: input.carbs ?? 0,
    fat: input.fat ?? 0,
  };

  for (const [k, v] of Object.entries(base)) {
    if (!Number.isFinite(v) || v < 0) {
      throw Object.assign(new Error("GOAL_INVALID"), {
        code: "GOAL_INVALID",
        meta: { field: k, value: v },
      });
    }
  }
  return base;
}