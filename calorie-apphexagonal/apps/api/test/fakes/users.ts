import type { UserRepository, User } from "../../src/module/auth/repository/user.repository";

export function makeUsersRepo(): UserRepository {
  const data: User[] = [];

  return {
    async getByEmail(email: string) {
      return data.find((u) => u.email === email) ?? null;
    },

    async create(email: string, passwordHash: string) {
      const u: User = {
        id: `u_${Math.random().toString(36).slice(2, 10)}`,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      data.push(u);
      return u;
    },

    // Si algún test necesita inspeccionar el estado:
    // __peek: () => data
  } as UserRepository;
}
