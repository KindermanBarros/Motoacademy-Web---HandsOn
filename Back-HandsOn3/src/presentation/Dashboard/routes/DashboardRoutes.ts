import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../../midleware/authMiddleware';
import type { Express } from 'express-serve-static-core';

export function setDashboardRoutes(app: Express) {
  const dashboardRouter = Router();
  const controller = new DashboardController();

  dashboardRouter.get(
    '/clients-summary',
    authMiddleware,
    controller.getClientOrdersSummary.bind(controller)
  );

  dashboardRouter.get(
    '/status-summary',
    authMiddleware,
    controller.getStatusSummary.bind(controller)
  );

  app.use('/dashboard', dashboardRouter);
}
