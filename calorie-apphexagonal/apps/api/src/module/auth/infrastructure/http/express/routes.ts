import { Router } from "express";
import { container } from "../../../../shared/infrastructure/di/container";

export function buildAuthRoutes() {
  const r = Router();
  const { authController } = container.authModule();

  r.get("/auth/ping", (_req, res) => res.json({ ok: true }));
  r.post("/auth/login", authController.login);
  r.post("/auth/register", authController.register);

  return r;
}