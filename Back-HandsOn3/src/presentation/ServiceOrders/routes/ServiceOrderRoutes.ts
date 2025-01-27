import { Router } from 'express';
import { ServiceOrderController } from '../controllers/ServiceOrderController';
import type { Express } from 'express-serve-static-core';

const router = Router();
const serviceOrderController = new ServiceOrderController();

export function setServiceOrderRoutes(app: Express) {
  app.use('/service-orders', router);
  router.get('/', serviceOrderController.getAll.bind(serviceOrderController));
  router.get(
    '/:id',
    serviceOrderController.getById.bind(serviceOrderController)
  );
  router.post('/', serviceOrderController.create.bind(serviceOrderController));
  router.put(
    '/:id',
    serviceOrderController.update.bind(serviceOrderController)
  );
  router.delete(
    '/:id',
    serviceOrderController.delete.bind(serviceOrderController)
  );
}
