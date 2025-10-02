import { Request, Response } from "express";
import { ProfileModel, type Activity, type GoalKind } from "../models/profile.model";
import { GoalModel } from "../models/goal.model";
import { calcGoalsFromProfile } from "../services/nutrition.service";

export const ProfileController = {
    get(req: any, res: Response) {
        const userId = req.user.sub as string;
        const p = ProfileModel.getByUser(userId);
        res.json(p || null);
    },

    put(req: any, res: Response) {
        const userId = req.user.sub as string;
        const { sex, age, heightCm, weightKg, bodyFat, activity, goal } = req.body || {};

        // Validación mínima
        if (!sex || !["male", "female"].includes(sex)) return res.status(400).type("text").send("sex inválido");
        if (!Number.isInteger(age) || age <= 0) return res.status(400).type("text").send("age inválido");
        if (!Number.isInteger(heightCm) || heightCm <= 0) return res.status(400).type("text").send("heightCm inválido");
        if (typeof weightKg !== "number" || weightKg <= 0) return res.status(400).type("text").send("weightKg inválido");
        if (bodyFat != null && (typeof bodyFat !== "number" || bodyFat < 0 || bodyFat > 60)) return res.status(400).type("text").send("bodyFat inválido");
        const activities: Activity[] = ["sedentary", "light", "moderate", "active", "veryActive"];
        if (!activities.includes(activity)) return res.status(400).type("text").send("activity inválida");
        const goals: GoalKind[] = ["cut", "maintain", "bulk"];
        if (!goals.includes(goal)) return res.status(400).type("text").send("goal inválido");

        // Guarda perfil
        const saved = ProfileModel.upsert(userId, { sex, age, heightCm, weightKg, bodyFat, activity, goal });

        // Calcula y guarda metas
        const g = calcGoalsFromProfile({ sex, age, heightCm, weightKg, bodyFat, activity, goal });
        GoalModel.upsert(userId, g);

        res.json({ profile: saved, goals: g });
    },
};