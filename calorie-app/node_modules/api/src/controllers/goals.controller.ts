import { Request, Response } from "express";
import { GoalModel } from "../models/goal.model";

export const GoalsController = {
    get(req: Request, res: Response) {
        const g = GoalModel.getByUser(req.user.sub); //req.user viene del middleware auth, busca las metas del usuario autenticado
        res.json(g || null);
    },
    put(req: Request, res: Response) {
        const { calories, protein, carbs, fat } = req.body || {}; //lee los datos del body
        if (!Number.isInteger(calories) || calories <= 0) {
        return res.status(400).json({ error: "calories debe ser entero > 0" });
        }
        type Patch = { calories: number; protein?: number; carbs?: number; fat?: number }; //tipo para el patch para evitar el any debajo
        const patch: Patch = { calories };
        if (protein != null && (!Number.isInteger(protein) || protein < 0)) return res.status(400).json({ error: "protein inválido" });
        if (carbs != null && (!Number.isInteger(carbs) || carbs < 0)) return res.status(400).json({ error: "carbs inválido" });
        if (fat != null && (!Number.isInteger(fat) || fat < 0)) return res.status(400).json({ error: "fat inválido" });
        if (protein != null) patch.protein = protein;
        if (carbs != null) patch.carbs = carbs;
        if (fat != null) patch.fat = fat;
        const g = GoalModel.upsert(req.user.sub, patch); //si pasa la validación, crea o actualiza la meta del usuario autenticado
        res.json(g);
    }
};