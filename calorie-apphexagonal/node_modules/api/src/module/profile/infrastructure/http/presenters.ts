export function presentProfileAndGoals(
  profile: any,
  goals: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
  }
) {
  return {
    profile,
    goals: {
      ...goals,
      // 🔁 Alias más legible para la vista o la API
      calories: goals.kcal,
    },
  };
}
