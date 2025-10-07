//valida con zod, llama al servicio y devuelve la respuesta.

import { Request, Response } from "express";
import { FoodsQuerySchema, FoodIdParamsSchema } from "../schemas/foods.dto";
import { buildFoodsService } from "../composition/foods.composition";

const foodsService = buildFoodsService();

export const FoodsController = {
async list(req: Request, res: Response) {
const parsed = FoodsQuerySchema.safeParse(req.query);
if (!parsed.success) {
return res.status(400).json({ error: "Datos inválidos", errors: parsed.error.flatten() });
}
const { search, page, pageSize } = parsed.data;
const result = await foodsService.list({ search, page, pageSize });
// Compat con frontend: devolver solo el array
return res.status(200).json(result.items);
},

async getById(req: Request, res: Response) {
const parsed = FoodIdParamsSchema.safeParse(req.params);
if (!parsed.success) {
return res.status(400).json({ error: "Datos inválidos", errors: parsed.error.flatten() });
}
const { id } = parsed.data;
const food = await foodsService.getById(id);
if (!food) return res.status(404).json({ error: "No encontrado" });
return res.status(200).json(food);
},
};