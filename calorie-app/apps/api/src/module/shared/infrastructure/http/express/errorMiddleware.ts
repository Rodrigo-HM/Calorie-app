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
        message: i.message
      })),
    });
  }

  // Errores de dominio simples
  if (err?.name === 'DomainError') {
    const status = err.message === 'NOT_FOUND' ? 404 : 400;
    return res.status(status).json({ error: err.message });
  }

  // Fallback
  // eslint-disable-next-line no-console
  console.error('[UNHANDLED]', err);
  return res.status(500).json({ error: 'Internal Server Error' });
}
