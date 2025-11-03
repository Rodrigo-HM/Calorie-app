import type { UserRepository } from "src/module/auth/domain/UserRepository";
import type { User } from "src/module/auth/domain/User";

export function makeUsersRepoFake(initial?: User[] | null): UserRepository & {
  // Alias opcional para compat con tests antiguos
  getByEmail?: (email: string) => Promise<User | null>;
} {
  const items = Array.isArray(initial) ? initial : [];
  const byEmail = new Map<string, User>(items.map((u) => [u.email.trim().toLowerCase(), u]));

  const findByEmail = async (email: string): Promise<User | null> => {
    return byEmail.get(email.trim().toLowerCase()) ?? null;
  };

  return {
    // Contrato actual
    findByEmail,

    async create(user: User): Promise<void> {
      byEmail.set(user.email.trim().toLowerCase(), user);
    },

    // Compat (por si algún test sigue llamando getByEmail)
    getByEmail: findByEmail,
  };
}

// Alias para mantener el mismo nombre de export si lo usabas así
export const makeUsersRepo = makeUsersRepoFake;