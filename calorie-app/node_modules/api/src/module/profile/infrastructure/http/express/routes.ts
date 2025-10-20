import { Router } from 'express';
import { container } from '../../../../shared/infrastructure/di/container';

export function buildProfileRoutes() {
  const r = Router();
  const { profileController } = container.profileModule();

  // SIN prefijo /api (AppBuilder lo añade)
  r.get('/users/me/profile', profileController.get);
  r.put('/users/me/profile', profileController.update);

  // Ping opcional
  r.get('/ping-profile', (req, res) => res.json({ ok: true }));

  return r;
}
