import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';
import type { Express } from 'express-serve-static-core';
import { authMiddleware } from '../../midleware/authMiddleware';

export function setClientRoutes(app: Express): void {
  const router = Router();
  const controller = new ClientController();

  router.use(authMiddleware);
  
  router.post('/', controller.create);
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  app.use('/clients', router);
}
