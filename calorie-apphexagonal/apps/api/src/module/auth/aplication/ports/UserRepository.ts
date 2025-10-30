export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export interface UsersRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: { email: string; passwordHash: string }): Promise<User>;
}