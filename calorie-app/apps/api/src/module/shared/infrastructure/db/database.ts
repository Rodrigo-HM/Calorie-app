import path from "path";
import fs from "fs";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/config";

type DBSchema = {
users: any[];
foods: any[];
entries: any[];
goals: any[];
profiles: any[];
weightLogs: any[];
};

const dbFile = config.dbPath;

const dir = path.dirname(dbFile);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
if (!fs.existsSync(dbFile)) {
fs.writeFileSync(
dbFile,
JSON.stringify({ users: [], foods: [], entries: [], goals: [], profiles: [], weightLogs: [] }, null, 2)
);
}

const adapter = new JSONFileSync<DBSchema>(dbFile);
export const db = new LowSync<DBSchema>(adapter, {
users: [],
foods: [],
entries: [],
goals: [],
profiles: [],
weightLogs: [],
});

export function initDb() {
db.read();
db.data!.users ||= [];
db.data!.foods ||= [];
db.data!.entries ||= [];
db.data!.goals ||= [];
db.data!.profiles ||= [];
db.data!.weightLogs ||= [];
db.write();
}

export function seedFoodsIfEmpty() {
db.read();
if ((db.data!.foods ?? []).length > 0) return;
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
{ name: "Pan integral", kcal: 247, protein: 13, carbs: 41, fat: 4.2 },
];
db.data!.foods.push(...base.map(f => ({ id: uuidv4(), createdAt: now, ...f })));
db.write();
}

export function save() {
db.write();
}

export const DB_META = { dbFile };