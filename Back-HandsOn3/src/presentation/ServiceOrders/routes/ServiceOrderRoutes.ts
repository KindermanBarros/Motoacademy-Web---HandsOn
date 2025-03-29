import { Router } from 'express';
import { ServiceOrderController } from '../controllers/ServiceOrderController';
import { authMiddleware } from '../../midleware/authMiddleware';
import type { Express } from 'express-serve-static-core';

export function setServiceOrderRoutes(app: Express) {
  const serviceOrderRouter = Router();
  const controller = new ServiceOrderController();

  serviceOrderRouter.get('/', authMiddleware, controller.getAll.bind(controller));
  serviceOrderRouter.get(
    '/user/:userId',
    authMiddleware,
    controller.getAllByUser.bind(controller)
  );
  serviceOrderRouter.post('/', authMiddleware, controller.create.bind(controller));

  serviceOrderRouter.get(
    '/:id',
    authMiddleware,
    controller.getById.bind(controller)
  );
  serviceOrderRouter.put('/:id', authMiddleware, controller.update.bind(controller));
  serviceOrderRouter.delete(
    '/:id',
    authMiddleware,
    controller.delete.bind(controller)
  );
  serviceOrderRouter.patch(
    '/:id/status',
    authMiddleware,
    controller.updateStatus.bind(controller)
  );

  app.use('/service-orders', serviceOrderRouter);
}
