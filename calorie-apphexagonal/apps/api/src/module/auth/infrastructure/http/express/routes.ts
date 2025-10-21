import { Router } from 'express';
import { container } from '../../../../shared/infrastructure/di/container';

export function buildAuthRoutes() {
  const r = Router();
  const { authController } = container.authModule();

  r.get('/auth/ping', (_req, res) => res.json({ ok: true }));
  // SIN prefijo /api (se añade en AppBuilder)
  r.post('/auth/login', authController.login);
  r.post('/auth/register', authController.register);

  return r;
}
