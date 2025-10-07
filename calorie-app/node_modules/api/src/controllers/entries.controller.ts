import { Request, Response, RequestHandler } from "express";
import { EntryModel } from "../models/entry.model";
import { FoodModel } from "../models/food.model";
import { db } from "../db";

type AuthedRequest = Request & {
user: { id: string; sub?: string; email?: string };
};

export const listToday: RequestHandler = (req, res) => {
const userId = (req as AuthedRequest).user.id;
const day = (req.query.date as string) || new Date().toISOString().slice(0, 10);
const items = EntryModel.listByUserAndDay(userId, day);

const foods = FoodModel.list();
const map = new Map(foods.map((f) => [f.id, f]));
const totals = items.reduce(
(acc, e) => {
const f = map.get(e.foodId);
if (!f) return acc;
const factor = e.grams / 100;
acc.kcal += f.kcal * factor;
acc.protein += f.protein * factor;
acc.carbs += f.carbs * factor;
acc.fat += f.fat * factor;
return acc;
},
{ kcal: 0, protein: 0, carbs: 0, fat: 0 }
);

res.json({ items, totals });
};

export const create: RequestHandler = (req, res) => {
const userId = (req as AuthedRequest).user.id;
const { foodId, grams, date } = req.body || {};

if (!foodId || typeof foodId !== "string") {
return res.status(400).json({ error: "foodId requerido" });
}
if (!Number.isInteger(grams) || grams <= 0) {
return res.status(400).json({ error: "grams debe ser entero positivo" });
}

const food = FoodModel.getById(foodId);
if (!food) return res.status(400).json({ error: "foodId inválido" });

const iso = (date ? new Date(date) : new Date()).toISOString();
const item = EntryModel.create(userId, foodId, Number(grams), iso);
res.status(201).json(item);
};

export const remove: RequestHandler = (req, res) => {
const userId = (req as AuthedRequest).user.id;
const removed = EntryModel.deleteByIdForUser(req.params.id, userId);
if (!removed) return res.status(404).json({ error: "Not found" });
res.json(removed);
};

export const update: RequestHandler = (req, res) => {
const userId = (req as AuthedRequest).user.id;
const id = req.params.id;
const { grams } = req.body || {};

if (!Number.isInteger(grams) || grams <= 0) {
return res.status(400).type("text").send("grams inválido");
}

db.read();
const arr = (db.data as any).entries as any[];
const item = arr.find((e) => e.id === id && e.userId === userId);
if (!item) return res.status(404).type("text").send("Not found");

item.grams = grams;
db.write();
res.json(item);
};