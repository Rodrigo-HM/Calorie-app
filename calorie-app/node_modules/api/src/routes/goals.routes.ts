import { Router } from "express";
import { GoalsController } from "../controllers/goals.controller";
import { auth } from "../middlewares/auth";

const r = Router();
r.use(auth); //aplica el middleware auth a todas las rutas de este router
r.get("/", GoalsController.get);
r.put("/", GoalsController.put);
export default r;