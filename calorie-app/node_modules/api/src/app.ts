import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as DB from "./database"; // <- importa funciones
import router from "./routes";
import { config } from "./config/config";
import { initDb, seedFoodsIfEmpty } from "./database"; 

export const createApp = () => {
initDb();
// si está vacío, siembra (también en test)
seedFoodsIfEmpty();

const app = express();
//middlewares globales
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

//define health

app.get("/health", (_req, res) => res.json({ ok: true }));

//monta el router principal en /api
app.use("/api", router);

//Manejo de errores genéricos
app.use((err: any, _req: any, res: any, _next: any) => {
console.error(err);
res.status(500).json({ error: "Internal Error" });
});

return app;
};

const app = createApp();
export default app;