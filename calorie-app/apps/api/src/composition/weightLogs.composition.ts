import { WeightLogsService } from "../services/weightLogs.service";
import { WeightLogsAdapter } from "../repositories/impl/weightLogs.adapter";

export function buildWeightLogsService() {
const repo = new WeightLogsAdapter();
return new WeightLogsService(repo);
}