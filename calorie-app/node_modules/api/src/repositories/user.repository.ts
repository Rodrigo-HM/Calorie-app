export type DomainUser = {
  id: string;
  email: string;
  emailNorm?: string;
  passwordHash: string;
  createdAt: string;
};

export interface UserReader {
  getById(id: string): Promise<DomainUser | null>;
  getByEmail(email: string): Promise<DomainUser | null>;
}

export interface UserWriter {
  create(email: string, passwordHash: string): Promise<DomainUser>;
}

export type UserRepository = UserReader & UserWriter;
