import { ProfileService } from "../services/profile.service";
import { ProfileAdapter } from "../repositories/impl/profile.adapter";
import { buildGoalsService } from "./goals.composition";

export function buildProfileService() {
const repo = new ProfileAdapter();
const goals = buildGoalsService();
return new ProfileService(repo, goals);
}