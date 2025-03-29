import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';
import type { Express } from 'express-serve-static-core';
import { authMiddleware } from '../../midleware/authMiddleware';

export function setClientRoutes(app: Express): void {
  const router = Router();
  const controller = new ClientController();

  router.post('/', authMiddleware, controller.create.bind(controller));
  router.get('/', authMiddleware, controller.getAll.bind(controller));
  router.get('/:id', authMiddleware, controller.getById.bind(controller));
  router.put('/:id', authMiddleware, controller.update.bind(controller));
  router.delete('/:id', authMiddleware, controller.delete.bind(controller));

  app.use('/clients', router);
}
