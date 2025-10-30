import type { Goals } from "src/module/goals/aplication/ports/GoalsRepository";
import { presentGoals } from "src/module/goals/infrastructure/http/presenters";

export function presentProfileAndGoals(profile: any, goals: Goals) {
  return {
    profile,
    goals: presentGoals(goals),
  };
}