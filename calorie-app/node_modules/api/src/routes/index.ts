import { Router } from "express";
import auth from "./auth.routes";
import foods from "./foods.routes";
import entries from "./entries.routes";
import goals from "./goals.routes";
import profile from "./profile.routes";
import weightLogs from "./weightLog.routes";

const r = Router();
r.get("/", (_req, res) => res.json({ api: "ok" })); //ruta de prueba
r.use("/auth", auth);
r.use("/foods", foods);
r.use("/entries", entries);
r.use("/users/me/goals", goals);
r.use("/users/me/profile", profile);
r.use("/users/me/weight-logs", weightLogs);
export default r;