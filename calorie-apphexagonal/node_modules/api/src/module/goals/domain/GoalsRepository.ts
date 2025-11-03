import type { Goals, GoalsInput } from "./Goals";
export type { Goals, GoalsInput } from "./Goals";

export interface GoalsRepository {
  get(userId: string): Promise<Goals | null>;
  set(userId: string, data: Goals): Promise<Goals>;
}