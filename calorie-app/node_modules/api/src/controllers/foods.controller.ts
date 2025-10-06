import { Request, Response } from "express";
import { FoodModel } from "../models/food.model";

export const FoodsController = {
    list(req: Request, res: Response) {
        const search = (req.query.search as string) || undefined; //lee la query 'search' si existe
        const items = FoodModel.list(search); //llama al metodo list 
        res.json(items);
        },
    getById(req: Request, res: Response) {
        const f = FoodModel.getById(req.params.id);
        if (!f) return res.status(404).json({ error: "Not found" });
        res.json(f);
    }
};
