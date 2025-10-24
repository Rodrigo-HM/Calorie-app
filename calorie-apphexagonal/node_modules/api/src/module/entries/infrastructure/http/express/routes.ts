import { Router } from 'express';
import { container } from '../../../../shared/infrastructure/di/container';

export function buildEntriesRoutes() {
  const r = Router();
  const { entriesController } = container.entriesModule();

  // Endpoints de entries
  r.get('/entries', entriesController.list);
  r.post('/entries', entriesController.add);
  r.put('/entries/:id', entriesController.update);
  r.delete('/entries/:id', entriesController.remove);

  // Ping para comprobar que funciona
  r.get('/ping-entries', (req, res) => res.json({ ok: true }));

  return r;
}
