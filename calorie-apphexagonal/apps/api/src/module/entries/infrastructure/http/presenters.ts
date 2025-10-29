export function presentEntriesWithTotals(
  items: any[],
  totals: { kcal: number; protein: number; carbs: number; fat: number }
) {
  return {
    items,
    totals,
  };
}
