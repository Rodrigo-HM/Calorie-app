import { Router } from "express";
import { WeightLogController } from "../controllers/weightLog.controller";

const r = Router();
r.get("/", WeightLogController.list);
r.post("/", WeightLogController.create);
export default r;