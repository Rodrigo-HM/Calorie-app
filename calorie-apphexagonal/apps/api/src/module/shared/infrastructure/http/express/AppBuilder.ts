import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';


import { buildWeightLogsRoutes } from '../../../../weightLogs/infrastructure/http/express/routes';
import { buildAuthMiddlewareInstance } from '../../di/authMiddleware';
import { buildProfileRoutes } from '../../../../profile/infrastructure/http/express/routes';
import { buildAuthRoutes } from '../../../../auth/infrastructure/http/express/routes';
import { buildEntriesRoutes } from '../../../../entries/infrastructure/http/express/routes';
import { buildGoalsRoutes } from '../../../../goals/infrastructure/http/express/routes';
import { buildFoodsRoutes } from '../../../../foods/infrastructure/http/express/routes';
import { errorMiddleware } from './errorMiddleware';



export function buildApp() {
  const app = express();

  // Middleware global
  app.use(cors({ origin: true, credentials: true }));
  app.use(bodyParser.json());

  // Endpoint de health check
  app.get('/health', (req, res) => res.json({ ok: true }));

  // Rutas públicas
  app.use('/api', buildAuthRoutes());
  app.use('/api', buildFoodsRoutes());

  // Rutas protegidas (si activas auth)
  const auth = buildAuthMiddlewareInstance?.();
  if (auth) {
    app.use('/api', auth, buildEntriesRoutes());
    app.use('/api', auth, buildGoalsRoutes());
    app.use('/api', auth, buildProfileRoutes());
    app.use('/api', auth, buildWeightLogsRoutes());
  } else {
    // Si no tienes auth aún, monta directas
    app.use('/api', buildEntriesRoutes());
    app.use('/api', buildGoalsRoutes());
    app.use('/api', buildProfileRoutes());
    app.use('/api', buildWeightLogsRoutes());
  }

   // Ruta 404 para endpoints no encontrados
  app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.path }));

  // Middleware de manejo de errores — siempre al final
  app.use(errorMiddleware);

  return app;
}
