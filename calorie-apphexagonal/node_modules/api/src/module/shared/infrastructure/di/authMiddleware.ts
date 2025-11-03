import type { TokenService } from "src/module/auth/application/ports/security";

export function buildAuthMiddleware(tokens: TokenService) {
  return function authMiddleware(req: any, res: any, next: any) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "UNAUTHORIZED" });

    try {
      const payload = tokens.verify<any>(token);
      req.user = { id: payload.sub, email: payload.email };
      next();
    } catch {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }
  };
}