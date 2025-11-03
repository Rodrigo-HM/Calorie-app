import type { WeightLog } from "../../domain/WeightLogsRepository";

export type WeightLogDTO = {
  id: string;
  userId: string;
  dateISO: string;
  weightKg: number;
  createdAt: string;
  bodyFat?: number;
};
export type WeightLogView = WeightLogDTO & { date: string }; // alias legacy

function toDTO(w: WeightLog): WeightLogDTO {
  return {
    id: w.id,
    userId: w.userId,
    dateISO: w.dateISO,
    weightKg: w.weightKg,
    createdAt: w.createdAt,
    ...(w.bodyFat != null ? { bodyFat: w.bodyFat } : {}),
  };
}

export function presentWeightLog(w: WeightLog): WeightLogView {
  const dto = toDTO(w);
  return { ...dto, date: dto.dateISO };
}

export function presentWeightLogs(list: WeightLog[]): WeightLogView[] {
  return list.map(presentWeightLog);
}