import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';
import type { Express } from 'express-serve-static-core';

export function setClientRoutes(app: Express): void {
  const router = Router();
  const controller = new ClientController();

  router.post('/', controller.create.bind(controller));
  router.get('/', controller.getAll.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.put('/:id', controller.update.bind(controller));
  router.delete('/:id', controller.delete.bind(controller));

  app.use('/clients', router);
}
