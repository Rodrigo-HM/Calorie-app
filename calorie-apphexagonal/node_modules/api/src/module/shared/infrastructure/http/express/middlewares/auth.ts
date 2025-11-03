import type { Request, Response, NextFunction } from "express";

// Verificador asíncrono (encaja con JwtTokenService)
export interface TokenVerifier {
  verify<T = unknown>(token: string): Promise<T>;
}

// Crea el middleware de auth esperando un verificador async
export function buildAuthMiddleware(verifier: TokenVerifier) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = req.headers.authorization || "";
      const [scheme, token] = auth.split(" ");
      if (!token || (scheme && scheme.toLowerCase() !== "bearer")) {
        return res.status(401).json({ error: "UNAUTHORIZED" });
      }

      const payload = await verifier.verify<{ sub: string; email?: string }>(token);
      (req as any).user = { id: (payload as any).sub, email: (payload as any).email };
      return next();
    } catch {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }
  };
}