const isProd = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET || (isProd ? undefined : "dev_secret_change_me");

if (!jwtSecret) {
  throw new Error("JWT_SECRET es obligatorio en producción");
}

export const config = {
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
};
