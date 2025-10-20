import fs from "fs";
import os from "os";
import path from "path";
import { beforeEach, afterEach, vi } from "vitest";

let tmpDir: string;

beforeEach(() => {
tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "api-test-"));
const file = path.join(tmpDir, "db.json");

process.env.NODE_ENV = "test";
process.env.DB_PATH = file;

fs.writeFileSync(
file,
JSON.stringify({
users: [],
foods: [],
entries: [],
goals: [],
profiles: [],
weightLogs: [],
}),
"utf-8"
);

vi.resetModules(); // Fuerza que las próximas importaciones usen el nuevo DB_PATH
});

afterEach(() => {
try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
});

//aqui se crea una DB temporal vacía antes de cada test y se fuerza a recargar el módulo de la DB para que use esa DB temporal