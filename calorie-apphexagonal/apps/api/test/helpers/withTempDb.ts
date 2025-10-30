import fs from "fs";
import os from "os";
import path from "path";

export function withTempDb<T>(testFn: (dbPath: string) => Promise<T>) {
  return async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "appdb-"));
    const dbPath = path.join(dir, "db.json");
    fs.writeFileSync(
      dbPath,
      JSON.stringify({ users: [], foods: [], entries: [], goals: [], profiles: [], weightLogs: [] })
    );
    const prev = process.env.DB_PATH;
    process.env.DB_PATH = dbPath;
    try {
      return await testFn(dbPath);
    } finally {
      process.env.DB_PATH = prev;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };
}