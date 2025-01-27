import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import type { Express } from 'express-serve-static-core';

const router = Router();
const userController = new UserController();

export function setUserRoutes(app: Express) {
  app.use('/users', router);
  router.get('/', userController.getAll.bind(userController));
  router.get('/:id', userController.getById.bind(userController));
  router.post('/', userController.create.bind(userController));
  router.put('/:id', userController.update.bind(userController));
  router.delete('/:id', userController.delete.bind(userController));
}
