import { UserModel } from "../../models/user.model";
import { UserRepository, DomainUser } from "../user.repository";

export class UserModelAdapter implements UserRepository {
  async getByEmail(email: string): Promise<DomainUser | null> {
    const u = UserModel.getByEmail(email);
    return u ? { ...u, emailNorm: u.emailNorm ?? u.email.toLowerCase() } : null;
  }
  async getById(id: string): Promise<DomainUser | null> {
    const u = UserModel.getById(id);
    return u ?? null;
  }
  async create(email: string, passwordHash: string): Promise<DomainUser> {
    const u = UserModel.create(email, passwordHash);
    return { ...u, emailNorm: u.emailNorm ?? u.email.toLowerCase() };
  }
}

export const userRepository: UserRepository = new UserModelAdapter();
