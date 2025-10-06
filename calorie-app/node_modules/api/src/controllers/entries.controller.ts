import { Request, Response } from "express";
import { EntryModel } from "../models/entry.model";
import { FoodModel } from "../models/food.model";

export const EntriesController = {
listToday(req: Request, res: Response) {
    const userId = req.user.sub; //sub es el id del usuario en el token JWT, que se puso en AuthController.login
    const day = (req.query.date as string) || new Date().toISOString().slice(0, 10); //lee la query 'date' si existe, sino usa la fecha actual (YYYY-MM-DD
    const items = EntryModel.listByUserAndDay(userId, day); //lista las entradas del usuario en el dia dado
    // calcular totales
    const foods = FoodModel.list();
    const map = new Map(foods.map(f => [f.id, f])); //mapea por id para acceso rapido (calve, valor)
    const totals = items.reduce(
    (acc, e) => { //(acumulador, elementoActual) => {...}
    const f = map.get(e.foodId);
    if (!f) return acc;
    const factor = e.grams / 100;
    acc.kcal += f.kcal * factor;
    acc.protein += f.protein * factor;
    acc.carbs += f.carbs * factor;
    acc.fat += f.fat * factor;
    return acc;
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 } //valor inicial del acumulador, ya que !f
    );
    res.json({ items, totals });
},
create(req: Request, res: Response) {
    const userId = req.user.sub; //sub es el id del usuario en el token JWT, que se puso en AuthController.login
    const { foodId, grams, date } = req.body || {};
    if (!foodId || typeof foodId !== "string") return res.status(400).json({ error: "foodId requerido" });
    if (!Number.isInteger(grams) || grams <= 0) return res.status(400).json({ error: "grams debe ser entero positivo" });
    const food = FoodModel.getById(foodId); if (!food) return res.status(400).json({ error: "foodId inválido" });
    const iso = (date ? new Date(date) : new Date()).toISOString(); //si date existe, crea fecha con date, sino con fecha actual
    const item = EntryModel.create(userId, foodId, Number(grams), iso);
    res.status(201).json(item);
},
remove(req: Request, res: Response) {
    const userId = req.user.sub;
    const removed = EntryModel.deleteByIdForUser(req.params.id, userId);
    if (!removed) return res.status(404).json({ error: "Not found" });
    res.json(removed);
},
update(req: any, res: any) {
    const userId = req.user.sub as string;
    const id = req.params.id;
    const { grams } = req.body || {};
    if (!Number.isInteger(grams) || grams <= 0) {
        return res.status(400).type("text").send("grams inválido");
    }

    // lowdb: busca la entry, verifica que es del usuario y actualiza
    const { db } = require("../db"); // si no tienes importado db en este archivo, impórtalo arriba
    db.read();
    const arr = (db.data as any).entries as any[];
    const item = arr.find((e) => e.id === id && e.userId === userId);
    if (!item) return res.status(404).type("text").send("Not found");

    item.grams = grams;
    db.write();
    res.json(item);
}

};