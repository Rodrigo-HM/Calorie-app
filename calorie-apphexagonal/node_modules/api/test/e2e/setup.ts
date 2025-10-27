import fs from "fs";
import os from "os";
import path from "path";
import http from "http";
import { buildApp } from "../../src/module/shared/infrastructure/http/express/AppBuilder";

declare global {
  // eslint-disable-next-line no-var
  var e2e: { server: http.Server; url: string };
}

beforeAll(
  async () => {
    // Crear DB temporal por suite
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "calorie-e2e-"));
    const dbPath = path.join(tmpDir, "db.json");
    fs.writeFileSync(dbPath, "{}", "utf8");

    // Configurar entorno para la app real
    process.env.DB_PATH = dbPath;
    process.env.JWT_SECRET = "e2e_secret";
    process.env.JWT_EXPIRES_IN = "1h";
    process.env.NODE_ENV = "test";

    const app = buildApp();
    const server = app.listen(0);

    await new Promise<void>((res) => server.once("listening", () => res()));

    const addr = server.address();
    const port = typeof addr === "string" ? 80 : addr?.port ?? 80;
    const url = `http://127.0.0.1:${port}`;

    global.e2e = { server, url };
  },
  30_000 // timeout largo por si tarda en levantar
);

afterAll(async () => {
  await new Promise<void>((res) => global.e2e.server.close(() => res()));
});

export {};
