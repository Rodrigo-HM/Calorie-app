import type { StoredWeightLog } from "src/module/weightLogs/aplication/ports/WeightLogsRepository";

export type WeightLogView = Omit<StoredWeightLog, "userId" | "createdAt"> & { date: string };

export function presentWeightLog(w: StoredWeightLog | any): WeightLogView {
  const dateISO = (w.dateISO ?? w.date) as string; // compat: usa date si falta dateISO
  const { userId: _u, createdAt: _c, ...rest } = w;
  return { ...rest, date: dateISO };
}

export function presentWeightLogs(items: Array<StoredWeightLog | any>): WeightLogView[] {
  return items.map(presentWeightLog);
}