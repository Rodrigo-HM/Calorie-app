export class UpdateProfile {
  constructor(
    private readonly profileRepo: {
      get: (userId: string) => Promise<any | null>;
      update: (userId: string, patch: any) => Promise<any>;
    }
  ) {}

  async run(userId: string, patch: any) {
    return this.profileRepo.update(userId, patch ?? {});
  }
}
