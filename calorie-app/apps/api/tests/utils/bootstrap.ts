import type { Express } from "express";

export async function bootstrap(basePath: string = "/api"): Promise<Express> {
  const { createApp } = await import("../../src/app");
  const routesMod = await import("../../src/routes");
  const router = routesMod.default;

  const app = createApp();
  app.use(basePath, router);
  return app;
}
