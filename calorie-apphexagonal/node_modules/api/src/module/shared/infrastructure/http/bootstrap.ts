import express, { Router, RequestHandler } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { errorMiddleware } from "./express/errorMiddleware";

/**
 * Configura CORS y el parseo JSON global de la app.
 */
export function buildCorsAndJson(app: express.Express) {
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(bodyParser.json());
}

/**
 * Endpoint de salud: /health
 */
export function mountHealth(app: express.Express) {
  app.get("/health", (_req, res) => res.json({ ok: true }));
}

/**
 * Monta las rutas públicas bajo /api
 */
export function mountPublicRoutes(app: express.Express, publicRouter: Router) {
  app.use("/api", publicRouter);
}

/**
 * Monta las rutas protegidas con middleware de autenticación
 */
export function mountProtectedRoutes(
  app: express.Express,
  auth: RequestHandler,
  protectedRouter: Router
) {
  app.use("/api", auth, protectedRouter);
}

/**
 * Middleware para rutas no encontradas (404)
 */
export function mountNotFound(app: express.Express) {
  app.use((req, res) =>
    res.status(404).json({ error: "Not found", path: req.path })
  );
}

/**
 * Middleware global de manejo de errores (debe ir siempre al final)
 */
export function mountError(app: express.Express) {
  app.use(errorMiddleware);
}
