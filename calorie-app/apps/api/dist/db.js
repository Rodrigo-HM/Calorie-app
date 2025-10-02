"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.save = save;
const lowdb_1 = require("lowdb");
const node_1 = require("lowdb/node");
const uuid_1 = require("uuid");
const adapter = new node_1.JSONFileSync("db.json");
exports.db = new lowdb_1.LowSync(adapter, {
    users: [],
    foods: [],
    entries: [],
    goals: []
});
exports.db.read();
if (!exports.db.data) {
    exports.db.data = { users: [], foods: [], entries: [], goals: [] };
}
// Seed de alimentos si está vacío
if (exports.db.data.foods.length === 0) {
    const now = new Date().toISOString();
    const base = [
        { name: "Manzana", kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
        { name: "Arroz blanco", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
        { name: "Pechuga de pollo", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
        { name: "Huevo", kcal: 155, protein: 13, carbs: 1.1, fat: 11 },
        { name: "Leche desnatada", kcal: 34, protein: 3.4, carbs: 5, fat: 0.1 },
        { name: "Avena", kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
        { name: "Plátano", kcal: 89, protein: 1.1, carbs: 23, fat: 0.3 },
        { name: "Atún en agua", kcal: 116, protein: 26, carbs: 0, fat: 1 },
        { name: "Yogur natural 0%", kcal: 59, protein: 10, carbs: 3.6, fat: 0.4 },
        { name: "Pan integral", kcal: 247, protein: 13, carbs: 41, fat: 4.2 }
    ];
    exports.db.data.foods.push(...base.map(f => ({ id: (0, uuid_1.v4)(), createdAt: now, ...f })));
}
exports.db.write();
function save() {
    exports.db.write();
}
