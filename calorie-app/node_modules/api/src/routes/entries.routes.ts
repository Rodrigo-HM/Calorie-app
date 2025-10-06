import { Router } from "express";
import { EntriesController } from "../controllers/entries.controller";
import { auth } from "../middlewares/auth";

const r = Router();
r.use(auth); //aplica el middleware auth a todas las rutas de este router
r.get("/", EntriesController.listToday);
r.post("/", EntriesController.create);
r.delete("/:id", EntriesController.remove);
r.put("/:id", EntriesController.update);
export default r;