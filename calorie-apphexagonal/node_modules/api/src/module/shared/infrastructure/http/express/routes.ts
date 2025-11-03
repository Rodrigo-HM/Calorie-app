// src/module/shared/infrastructure/http/express/routes.ts
import { Router } from "express";
import { container } from "../../di/container";

// Routers de cada módulo (ya definen /foods, /entries, etc.)
import { buildFoodsRoutes } from "src/module/foods/infrastructure/http/express/routes";
import { buildEntriesRoutes } from "src/module/entries/infrastructure/http/express/routes";
import { buildGoalsRoutes } from "src/module/goals/infrastructure/http/express/routes";
import { buildWeightLogsRoutes } from "src/module/weightLogs/infrastructure/http/express/routes";
import { buildAuthRoutes } from "src/module/auth/infrastructure/http/express/routes";

export function buildApiRouter() {
  const api = Router();

  // Público
  api.use("/auth", buildAuthRoutes());

  // Protegido
  const { authMiddleware } = container.authz();
  api.use(authMiddleware);

  // OJO: estos routers ya incluyen /foods, /entries, etc. internamente
  api.use(buildFoodsRoutes());
  api.use(buildEntriesRoutes());
  api.use(buildGoalsRoutes());
  api.use(buildWeightLogsRoutes());

  return api;
}