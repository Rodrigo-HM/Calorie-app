"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middlewares/auth");
const r = (0, express_1.Router)();
r.use(auth_1.auth);
// GET /api/users/me/goals
r.get("/", (req, res) => {
    db_1.db.read();
    const userId = req.user.sub;
    const g = db_1.db.data.goals.find(x => x.userId === userId);
    res.json(g || null);
});
// PUT /api/users/me/goals { calories, protein?, carbs?, fat? }
r.put("/", (req, res) => {
    db_1.db.read();
    const userId = req.user.sub;
    const { calories, protein, carbs, fat } = req.body || {};
    if (!Number.isInteger(calories) || calories <= 0) {
        return res.status(400).json({ error: "calories debe ser entero > 0" });
    }
    const patch = { calories };
    if (protein != null) {
        if (!Number.isInteger(protein) || protein < 0)
            return res.status(400).json({ error: "protein inválido" });
        patch.protein = protein;
    }
    if (carbs != null) {
        if (!Number.isInteger(carbs) || carbs < 0)
            return res.status(400).json({ error: "carbs inválido" });
        patch.carbs = carbs;
    }
    if (fat != null) {
        if (!Number.isInteger(fat) || fat < 0)
            return res.status(400).json({ error: "fat inválido" });
        patch.fat = fat;
    }
    let g = db_1.db.data.goals.find(x => x.userId === userId);
    if (!g) {
        g = { id: userId, userId, ...patch };
        db_1.db.data.goals.push(g);
    }
    else {
        Object.assign(g, patch);
    }
    db_1.db.write();
    res.json(g);
});
exports.default = r;
