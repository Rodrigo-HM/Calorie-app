import type { NewWeightLog, StoredWeightLog } from "./WeightLogsRepository";

export interface IListWeightLogs {
  run(userId: string, range?: { from?: string; to?: string }): Promise<StoredWeightLog[]>;
}
export interface ICreateWeightLog {
  run(userId: string, log: NewWeightLog): Promise<StoredWeightLog>;
}