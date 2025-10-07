import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";

const r = Router();
r.get("/", ProfileController.get);
r.put("/", ProfileController.put);
export default r;