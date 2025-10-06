import { db } from "../db";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "veryActive";
export type GoalKind = "cut" | "maintain" | "bulk";

export type Profile = {
userId: string;
sex: "male" | "female";
age: number;
heightCm: number;
weightKg: number;
bodyFat?: number; // %
activity: Activity;
goal: GoalKind;
updatedAt: string;
};

type DBSchema = {
profiles: Profile[];
};

export const ProfileModel = {
    getByUser(userId: string): Profile | undefined {
        db.read();
        const arr = (db.data as any).profiles as Profile[] | undefined;
        return arr?.find(p => p.userId === userId);
    },
    upsert(userId: string, p: Omit<Profile, "userId" | "updatedAt">): Profile {
        db.read();
        if (!(db.data as any).profiles) (db.data as any).profiles = [];
        const arr = (db.data as any).profiles as Profile[];
        const now = new Date().toISOString();
        const existing = arr.find(x => x.userId === userId);
        if (existing) {
        Object.assign(existing, p, { updatedAt: now });
        } else {
        arr.push({ userId, ...p, updatedAt: now });
        }
        db.write();
        return this.getByUser(userId)!;
    }
};