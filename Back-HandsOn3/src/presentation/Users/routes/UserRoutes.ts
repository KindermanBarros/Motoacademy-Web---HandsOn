import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import type { Express } from 'express-serve-static-core';
import { authMiddleware } from '../../midleware/authMiddleware';

const router = Router();
const userController = new UserController();

export function setUserRoutes(app: Express) {
  app.use('/users', router);

  router.post('/login', userController.login);

  router.get('/profile', authMiddleware, userController.getProfile.bind(userController));

  router.get('/', authMiddleware, userController.getAll.bind(userController));
  router.post('/', authMiddleware, userController.create.bind(userController));
  router.put('/:id', authMiddleware, userController.update.bind(userController));
  router.delete('/:id', authMiddleware, userController.delete.bind(userController));
  router.get('/:id', authMiddleware, userController.getById.bind(userController));
}

