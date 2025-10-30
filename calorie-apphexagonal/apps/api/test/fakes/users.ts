import type { UsersRepository, User } from "src/module/auth/aplication/ports/UserRepository";

export function makeUsersRepo(seed: User[] = []): UsersRepository {
  // Índices por email e id para consultas rápidas y consistentes en tests
  const byEmail = new Map<string, User>(seed.map(u => [u.email, u]));
  const byId = new Map<string, User>(seed.map(u => [u.id, u]));
  let seq = seed.length; // contador simple para ids deterministas en tests

  return {
    async findByEmail(email: string): Promise<User | null> {
      return byEmail.get(email) ?? null;
    },

    async create(data: { email: string; passwordHash: string }): Promise<User> {
      const existing = byEmail.get(data.email);
      if (existing) return existing; // opcional: o lanza si tu servicio lo exige

      const user: User = {
        id: `u_${++seq}`,
        email: data.email,
        passwordHash: data.passwordHash,
        createdAt: new Date().toISOString(),
      };
      byEmail.set(user.email, user);
      byId.set(user.id, user);
      return user;
    },
  };
}
