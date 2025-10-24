import { Router } from 'express';
import { container } from '../../../../shared/infrastructure/di/container';

export function buildGoalsRoutes() {
  const r = Router();
  const { goalsController } = container.goalsModule();

  // SIN prefijo /api
  r.get('/users/me/goals', goalsController.get);
  r.put('/users/me/goals', goalsController.set);

  // Ping opcional
  r.get('/ping-goals', (req, res) => res.json({ ok: true }));

  return r;
}
