import { Router } from 'express';
import { container } from '../../../../shared/infrastructure/di/container';

export function buildFoodsRoutes() {
  const r = Router();
  const { foodsController } = container.foodsModule();

  // Rutas del módulo (sin prefijo /api, AppBuilder lo añade)
  r.get('/foods', foodsController.list);
  r.get('/foods/:id', foodsController.getById);


  return r;
}
