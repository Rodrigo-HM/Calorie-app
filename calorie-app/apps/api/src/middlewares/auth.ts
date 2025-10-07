import { Request, Response, NextFunction } from "express";
import { TokenVerifier } from "../services/token/token.types";

export function buildAuthMiddleware(verifier: TokenVerifier) {
return function auth(req: Request, res: Response, next: NextFunction) {
const isTest = process.env.NODE_ENV === "test";
const header = req.headers.authorization;
const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

// bypass en test: sin token o token == "test"
if (isTest && (!token || token === "test")) {
  (req as any).user = { id: "test-user", sub: "test-user", email: "test@example.com" };
  return next();
}

if (!token) return res.status(401).json({ error: "No token" });

try {
  const payload = verifier.verify<{ sub: string; email?: string }>(token);
  (req as any).user = { id: payload.sub, sub: payload.sub, email: payload.email };
  return next();
} catch {
  return res.status(401).json({ error: "Token inválido" });
}
};
}