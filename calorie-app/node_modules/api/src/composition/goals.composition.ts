import { GoalsService } from "../services/goals.service";
import { GoalsAdapter } from "../repositories/impl/goals.adapter";

export function buildGoalsService() {
const repo = new GoalsAdapter();
return new GoalsService(repo);
}