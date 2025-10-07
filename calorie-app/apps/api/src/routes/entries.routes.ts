import { Router } from "express";
import { listToday, create, remove, update } from "../controllers/entries.controller";

const r = Router();

r.get("/", listToday);
r.post("/", create);
r.delete("/:id", remove);
r.put("/:id", update);

export default r;