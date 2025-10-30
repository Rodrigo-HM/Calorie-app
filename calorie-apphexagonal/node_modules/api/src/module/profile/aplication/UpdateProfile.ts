import type {
  ProfileRepository,
  Profile,
} from '../aplication/ports/ProfileRepository';

export class UpdateProfile {
  constructor(private readonly profileRepo: ProfileRepository) {}

  async run(userId: string, patch: Partial<Omit<Profile, 'userId'>>): Promise<Profile> {
    return this.profileRepo.update(userId, patch ?? {});
  }
}