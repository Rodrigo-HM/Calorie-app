"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middlewares/auth");
const uuid_1 = require("uuid");
const r = (0, express_1.Router)();
r.use(auth_1.auth);
// GET /api/entries?date=YYYY-MM-DD
r.get("/", (req, res) => {
    db_1.db.read();
    const userId = req.user.sub;
    const day = req.query.date || new Date().toISOString().slice(0, 10);
    const items = db_1.db.data.entries.filter((e) => e.userId === userId && e.date.slice(0, 10) === day);
    const foodMap = new Map(db_1.db.data.foods.map((f) => [f.id, f]));
    const totals = items.reduce((acc, e) => {
        const f = foodMap.get(e.foodId);
        if (!f)
            return acc;
        const factor = e.grams / 100;
        acc.kcal += f.kcal * factor;
        acc.protein += f.protein * factor;
        acc.carbs += f.carbs * factor;
        acc.fat += f.fat * factor;
        return acc;
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
    res.json({ items, totals });
});
// POST /api/entries { foodId, grams, date? }
r.post("/", (req, res) => {
    db_1.db.read();
    const userId = req.user.sub;
    const { foodId, grams, date } = req.body || {};
    if (!foodId || typeof foodId !== "string")
        return res.status(400).json({ error: "foodId requerido" });
    if (!Number.isInteger(grams) || grams <= 0)
        return res.status(400).json({ error: "grams debe ser entero positivo" });
    const food = db_1.db.data.foods.find((f) => f.id === foodId);
    if (!food)
        return res.status(400).json({ error: "foodId inválido" });
    const item = {
        id: (0, uuid_1.v4)(),
        userId,
        foodId,
        grams: Number(grams),
        date: (date ? new Date(date) : new Date()).toISOString(),
    };
    db_1.db.data.entries.push(item);
    db_1.db.write();
    res.status(201).json(item);
});
// DELETE /api/entries/:id
r.delete("/:id", (req, res) => {
    db_1.db.read();
    const userId = req.user.sub;
    const idx = db_1.db.data.entries.findIndex((e) => e.id === req.params.id && e.userId === userId);
    if (idx === -1)
        return res.status(404).json({ error: "Not found" });
    const [removed] = db_1.db.data.entries.splice(idx, 1);
    db_1.db.write();
    res.json(removed);
});
exports.default = r;
