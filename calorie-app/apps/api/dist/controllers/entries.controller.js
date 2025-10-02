"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntriesController = void 0;
const entry_model_1 = require("../models/entry.model");
const food_model_1 = require("../models/food.model");
exports.EntriesController = {
    listToday(req, res) {
        const userId = req.user.sub;
        const day = req.query.date || new Date().toISOString().slice(0, 10);
        const items = entry_model_1.EntryModel.listByUserAndDay(userId, day);
        // calcular totales
        const foods = food_model_1.FoodModel.list();
        const map = new Map(foods.map(f => [f.id, f]));
        const totals = items.reduce((acc, e) => {
            const f = map.get(e.foodId);
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
    },
    create(req, res) {
        const userId = req.user.sub;
        const { foodId, grams, date } = req.body || {};
        if (!foodId || typeof foodId !== "string")
            return res.status(400).json({ error: "foodId requerido" });
        if (!Number.isInteger(grams) || grams <= 0)
            return res.status(400).json({ error: "grams debe ser entero positivo" });
        const food = food_model_1.FoodModel.getById(foodId);
        if (!food)
            return res.status(400).json({ error: "foodId inválido" });
        const iso = (date ? new Date(date) : new Date()).toISOString();
        const item = entry_model_1.EntryModel.create(userId, foodId, Number(grams), iso);
        res.status(201).json(item);
    },
    remove(req, res) {
        const userId = req.user.sub;
        const removed = entry_model_1.EntryModel.deleteByIdForUser(req.params.id, userId);
        if (!removed)
            return res.status(404).json({ error: "Not found" });
        res.json(removed);
    }
};
