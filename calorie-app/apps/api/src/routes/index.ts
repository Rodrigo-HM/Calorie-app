import { Router } from "express";
import auth from "./auth.routes";
import foods from "./foods.routes";
import entries from "./entries.routes";
import goals from "./goals.routes";
import profile from "./profile.routes";
import weightLogs from "./weightLog.routes";
import { buildAuthMiddlewareInstance } from "../composition/auth.composition";

const r = Router();
r.get("/", (_req, res) => res.json({ api: "ok" })); //ruta de prueba

// Públicas
r.use("/auth", auth);
r.use("/foods", foods);

// Protegidas
const authMw = buildAuthMiddlewareInstance();
r.use("/entries", authMw, entries);
r.use("/users/me/goals", authMw, goals);
r.use("/users/me/profile", authMw, profile);
r.use("/users/me/weight-logs", authMw, weightLogs);

export default r;