import type { ProfileRepository, ProfilePatch, Profile } from "./ports/ProfileRepository";

export class UpdateProfile {
  constructor(private readonly repo: ProfileRepository) {}

  async run(userId: string, patch: ProfilePatch): Promise<Profile> {
    // Aquí puedes añadir validaciones adicionales si las necesitas
    return this.repo.update(userId, patch);
  }
}