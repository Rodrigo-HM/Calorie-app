import { Router } from 'express';
import { container } from '../../../../shared/infrastructure/di/container';

export function buildWeightLogsRoutes() {
  const r = Router();
  const { weightLogsController } = container.weightLogsModule();

  // SIN prefijo /api (AppBuilder lo añade)
  r.get('/users/me/weight-logs', weightLogsController.list);
  r.post('/users/me/weight-logs', weightLogsController.create);

  return r;
}
