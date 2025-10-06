import { Router } from "express";
import { auth } from "../middlewares/auth";
import { WeightLogController } from "../controllers/weightLog.controller";
const r = Router();
r.use(auth);
r.get("/", WeightLogController.list);
r.post("/", WeightLogController.create);
export default r;