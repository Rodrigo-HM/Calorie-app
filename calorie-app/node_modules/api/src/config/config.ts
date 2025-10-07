import path from "path";

const env = process.env.NODE_ENV || "development";
const isProd = env === "production";
const isTest = env === "test";

const jwtSecret = process.env.JWT_SECRET || (isProd ? undefined : "dev_secret_change_me");
if (!jwtSecret) throw new Error("JWT_SECRET es obligatorio en producción");
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "2h";

// Apuntar a apps/api/db.json (sube DOS niveles desde src/config)
const dbPath = process.env.DB_PATH || path.resolve(__dirname, "..", "..", "db.json");

export const config = { env, isProd, isTest, jwtSecret, jwtExpiresIn, dbPath };