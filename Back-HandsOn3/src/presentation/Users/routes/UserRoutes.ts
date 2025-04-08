import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import type { Express } from 'express-serve-static-core';
import { authMiddleware } from '../../midleware/authMiddleware';

const router = Router();
const userController = new UserController();

export function setUserRoutes(app: Express) {
  app.use('/users', router);

  router.post('/register', userController.create);
  router.post('/login', userController.login);

  router.use(authMiddleware);
  
  router.get('/profile', userController.getProfile);
  router.get('/', userController.getAll);
  router.get('/:id', userController.getById);
  router.put('/:id', userController.update);
  router.delete('/:id', userController.delete);
}

