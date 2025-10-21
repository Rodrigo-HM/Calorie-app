import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { errorMiddleware } from './errorMiddleware';
import { buildAuthRoutes } from 'src/module/auth/infrastructure/http/express/routes';
import { buildFoodsRoutes } from 'src/module/foods/infrastructure/http/express/routes';
import { buildGoalsRoutes } from 'src/module/goals/infrastructure/http/express/routes';
import { buildEntriesRoutes } from 'src/module/entries/infrastructure/http/express/routes';
import { buildProfileRoutes } from 'src/module/profile/infrastructure/http/express/routes';
import { buildWeightLogsRoutes } from 'src/module/weightLogs/infrastructure/http/express/routes';

export function buildApp() {
  const app = express();

  // Logging de requests
  app.use((req, res, next) => {
    console.log('[REQ]', req.method, req.path);
    next();
  });

  app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
  app.use(bodyParser.json());

  app.get('/health', (req, res) => res.json({ ok: true }));

  // Rutas con prefijo /api
  app.use('/api', buildAuthRoutes());
  app.use('/api', buildFoodsRoutes());
  app.use('/api', buildGoalsRoutes());
  app.use('/api', buildEntriesRoutes());
  app.use('/api', buildProfileRoutes());      
  app.use('/api', buildWeightLogsRoutes()); 

  // 404
  app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.path }));

  app.use(errorMiddleware);

  return app;
}
