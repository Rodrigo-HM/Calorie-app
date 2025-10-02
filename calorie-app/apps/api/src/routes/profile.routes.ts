import { Router } from "express";
import { auth } from "../middlewares/auth";
import { ProfileController } from "../controllers/profile.controller";
const r = Router();
r.use(auth);
r.get("/", ProfileController.get);
r.put("/", ProfileController.put);
export default r;