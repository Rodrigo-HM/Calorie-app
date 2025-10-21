import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Validación (Zod)
  if (err?.name === 'ZodError' && Array.isArray(err.issues)) {
    return res.status(400).json({
      error: 'Validación',
      details: err.issues.map((i: any) => ({
        path: i.path?.join('.') ?? '',
        message: i.message,
      })),
    });
  }

  // Errores de dominio simples
  if (err?.name === 'DomainError') {
    const status = err.message === 'NOT_FOUND' ? 404 : 400;
    return res.status(status).json({ error: err.message });
  }

  // Mapeo por code (Auth y otros)
  // Permite que servicios hagan: throw Object.assign(new Error('...'), { code: '...' })
  if (typeof err?.code === 'string') {
    const code = err.code as string;
    const codeStatus: Record<string, number> = {
      INVALID_CREDENTIALS: 401,
      EMAIL_TAKEN: 409,
      NOT_FOUND: 404,
      FOOD_NOT_FOUND: 400,
    };
    const status = codeStatus[code] ?? 400;
    return res.status(status).json({ error: code });
  }

  // Fallback para errores no controlados
  // eslint-disable-next-line no-console
  console.error('[UNHANDLED]', err);
  return res.status(500).json({ error: 'Internal Server Error' });
}
