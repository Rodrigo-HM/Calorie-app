import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "./db";
import router from "./routes";

export const createApp = () => {
const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

// Deja el handler de errores al final
app.use((err: any, _req: any, res: any, _next: any) => {
console.error(err);
res.status(500).json({ error: "Internal Error" });
});

return app;
};

// App “lista” que usas en server.ts
const app = createApp();
app.use("/api", router);
export default app;