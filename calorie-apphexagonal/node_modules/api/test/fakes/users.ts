import { UserRepository } from "../../src/module/auth/domain/UserRepository";
import { User } from "../../src/module/auth/domain/User";

export function makeUsersRepoFake(initial: User[] = []): UserRepository {
  const byEmail = new Map(initial.map((u) => [u.email, u]));
  return {
    async getByEmail(email: string) {
      return byEmail.get(email.trim().toLowerCase()) ?? null;
    },
    async create(user: User) {
      byEmail.set(user.email, user);
      return user;
    },
  };
}
export const makeUsersRepo = makeUsersRepoFake;