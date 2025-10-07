import { ProfileRepository, Profile } from "../profile.repository";
import { ProfileModel } from "../../models/profile.model";

export class ProfileAdapter implements ProfileRepository {
async getByUser(userId: string): Promise<Profile | null> {
const p = ProfileModel.getByUser(userId);
return p ?? null;
}

async upsert(
userId: string,
data: Omit<Profile, "userId" | "updatedAt">
): Promise<Profile> {
return ProfileModel.upsert(userId, data) as any;
}
}