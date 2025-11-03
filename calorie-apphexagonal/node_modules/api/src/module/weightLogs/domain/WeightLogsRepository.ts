import { WeightLog } from "./WeightLog";
export { WeightLog } from "./WeightLog";

export interface WeightLogsRepository {
  listByUser(
    userId: string,
    range?: { from?: string; to?: string }
  ): Promise<WeightLog[]>;

  create(log: WeightLog): Promise<WeightLog>;
}