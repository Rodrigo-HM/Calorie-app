import { Router } from "express";
import { GoalsController } from "../controllers/goals.controller";

const r = Router();
r.get("/", GoalsController.get);
r.put("/", GoalsController.set);
export default r;