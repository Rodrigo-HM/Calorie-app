import fs from "fs";
import os from "os";
import path from "path";

/**
- Ejecuta un test con una DB JSON temporal aislada.
- Invalida la caché de módulos antes de requerir database/buildApp/repos.
- Usa jest.isolateModules para garantizar que los imports usan el DB_PATH del test.
*/
export function withTempDb<T>(testFn: (ctx: {
  dbPath: string;
  requireModule: <M = any>(p: string) => M;
}) => Promise<T>) {
  return async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "appdb-"));
    const dbPath = path.join(dir, "db.json");
    fs.writeFileSync(
      dbPath,
      JSON.stringify({
        users: [],
        foods: [],
        entries: [],
        goals: [],
        profiles: [],
        weightLogs: [],
      })
    );

    const prev = process.env.DB_PATH;
    process.env.DB_PATH = dbPath;

    try {
      // Muy importante: resetea caché y aisle imports por test
      jest.resetModules();

      const requireModule = <M = any>(p: string) => {
        let mod!: M;
        jest.isolateModules(() => {
          // require relativo al rootDir de Jest
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          mod = require(p);
        });
        return mod;
      };

      await testFn({ dbPath, requireModule });
    } finally {
      process.env.DB_PATH = prev;
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  };
}