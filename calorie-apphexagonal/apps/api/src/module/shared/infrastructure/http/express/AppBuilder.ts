import express from "express";
import { buildFoodsRoutes } from "../../../../foods/infrastructure/http/express/routes";
import { buildAuthRoutes } from "../../../../auth/infrastructure/http/express/routes";
import { buildEntriesRoutes } from "../../../../entries/infrastructure/http/express/routes";
import { buildGoalsRoutes } from "../../../../goals/infrastructure/http/express/routes";
import { buildProfileRoutes } from "../../../../profile/infrastructure/http/express/routes";
import { buildWeightLogsRoutes } from "../../../../weightLogs/infrastructure/http/express/routes";
import { buildAuthMiddlewareInstance } from "../../di/authMiddleware";
import {
  buildCorsAndJson,
  mountHealth,
  mountPublicRoutes,
  mountProtectedRoutes,
  mountNotFound,
  mountError,
} from "../bootstrap";

export function buildApp() {
  const app = express();

  // 1. Middlewares globales
  buildCorsAndJson(app);
  mountHealth(app);

  // 2. Rutas públicas
  const publicRouter = express.Router();
  publicRouter.use(buildAuthRoutes());
  publicRouter.use(buildFoodsRoutes());
  mountPublicRoutes(app, publicRouter);

  // 3. Rutas protegidas
  const protectedRouter = express.Router();
  protectedRouter.use(buildEntriesRoutes());
  protectedRouter.use(buildGoalsRoutes());
  protectedRouter.use(buildProfileRoutes());
  protectedRouter.use(buildWeightLogsRoutes());

  // 4. Autenticación (modo con o sin auth)
  const auth = buildAuthMiddlewareInstance?.();
  if (auth) {
    mountProtectedRoutes(app, auth, protectedRouter);
  } else {
    // Modo desarrollo sin autenticación
    app.use("/api", protectedRouter);
  }

  // 5. Manejo de rutas no encontradas y errores
  mountNotFound(app);
  mountError(app);

  return app;
}
