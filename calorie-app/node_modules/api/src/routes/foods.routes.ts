//mapea las URLs a los métodos del controller (GET /api/foods, GET /api/foods/:id).

import { Router } from "express";
import { FoodsController } from "../controllers/foods.controller";

const r = Router();
r.get("/", FoodsController.list);
r.get("/:id", FoodsController.getById);
export default r;