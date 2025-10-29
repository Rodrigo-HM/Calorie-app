import type { GoalsDTO } from "../../../goals/infrastructure/http/presenters";
import { presentGoals } from "../../../goals/infrastructure/http/presenters";

export function presentProfileAndGoals(profile: any, goals: GoalsDTO) {
  return {
    profile,
    goals: presentGoals(goals),
  };
}
