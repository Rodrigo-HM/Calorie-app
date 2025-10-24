import { Router } from 'express';
import { container } from '../../../../shared/infrastructure/di/container';

export function buildFoodsRoutes() {
  const r = Router();
  const { foodsController } = container.foodsModule();

  // SIN prefijo /api (se añade en AppBuilder)
  r.get('/foods', foodsController.list);
 };
