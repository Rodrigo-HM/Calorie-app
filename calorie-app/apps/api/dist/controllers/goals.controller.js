"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalsController = void 0;
const goal_model_1 = require("../models/goal.model");
exports.GoalsController = {
    get(req, res) {
        const g = goal_model_1.GoalModel.getByUser(req.user.sub);
        res.json(g || null);
    },
    put(req, res) {
        const { calories, protein, carbs, fat } = req.body || {};
        if (!Number.isInteger(calories) || calories <= 0) {
            return res.status(400).json({ error: "calories debe ser entero > 0" });
        }
        const patch = { calories };
        if (protein != null && (!Number.isInteger(protein) || protein < 0))
            return res.status(400).json({ error: "protein inválido" });
        if (carbs != null && (!Number.isInteger(carbs) || carbs < 0))
            return res.status(400).json({ error: "carbs inválido" });
        if (fat != null && (!Number.isInteger(fat) || fat < 0))
            return res.status(400).json({ error: "fat inválido" });
        if (protein != null)
            patch.protein = protein;
        if (carbs != null)
            patch.carbs = carbs;
        if (fat != null)
            patch.fat = fat;
        const g = goal_model_1.GoalModel.upsert(req.user.sub, patch);
        res.json(g);
    }
};
