"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const r = (0, express_1.Router)();
// GET /api/foods?search=manzana
r.get("/", (req, res) => {
    db_1.db.read();
    const q = (req.query.search || "").toLowerCase().trim();
    let items = db_1.db.data.foods;
    if (q)
        items = items.filter(f => f.name.toLowerCase().includes(q));
    res.json(items);
});
// GET /api/foods/:id
r.get("/:id", (req, res) => {
    db_1.db.read();
    const f = db_1.db.data.foods.find(x => x.id === req.params.id);
    if (!f)
        return res.status(404).json({ error: "Not found" });
    res.json(f);
});
// Opcional: crear alimentos (útil para seeds manuales o admin)
// Descomenta si quieres permitir crear desde la API.
// r.post("/", (req, res) => {
// db.read();
// const { name, kcal, protein, carbs, fat } = req.body || {};
// if (!name || kcal == null || protein == null || carbs == null || fat == null) {
// return res.status(400).json({ error: "Campos requeridos: name, kcal, protein, carbs, fat" });
// }
// if (db.data!.foods.find(f => f.name.toLowerCase() === name.toLowerCase())) {
// return res.status(409).json({ error: "Food ya existe" });
// }
// const item = { id: uuid(), createdAt: new Date().toISOString(), name, kcal: Number(kcal), protein: Number(protein), carbs: Number(carbs), fat: Number(fat) };
// db.data!.foods.push(item);
// db.write();
// res.status(201).json(item);
// });
exports.default = r;
