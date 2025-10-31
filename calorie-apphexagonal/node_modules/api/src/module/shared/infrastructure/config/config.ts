import path from "path";

const env = process.env.NODE_ENV || "development";
const isProd = env === "production";
const isTest = env === "test";

const jwtSecret =
  process.env.JWT_SECRET || (isProd ? undefined : "dev_secret_change_me");

if (!jwtSecret) {
  throw new Error("JWT_SECRET es obligatorio en producción");
}

const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "2h";

// IMPORTANTE: rutas relativas al workspace de la API (apps/api), sin "apps/api/" delante.
// Cuando ejecutas "npm -w apps/api run dev", process.cwd() ya es apps/api.
const defaultDev = path.resolve(process.cwd(), "data/dev/db.json");
const defaultTest = path.resolve(process.cwd(), "data/test/db.json");

// Respeta DB_PATH si está definido; si no, usa por entorno:
const dbPath = process.env.DB_PATH || (isTest ? defaultTest : defaultDev);

export const config = {
  env,
  isProd,
  isTest,
  jwtSecret,
  jwtExpiresIn,
  dbPath,
};