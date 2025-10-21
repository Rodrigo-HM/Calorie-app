export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export interface UserRepository {
  getByEmail(email: string): Promise<User | null>;
  create(email: string, passwordHash: string): Promise<User>;
}
