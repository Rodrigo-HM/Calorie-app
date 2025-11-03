import { User } from "./User";

export interface UserRepository {
  getByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
}