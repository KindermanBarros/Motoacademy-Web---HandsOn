import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import type { Express } from 'express-serve-static-core';
import { authMiddleware } from '../../midleware/authMiddleware';

export function setReportRoutes(app: Express): void {
  const reportRouter = Router();
  const controller = new ReportController();

  reportRouter.get('/all', authMiddleware, controller.getFilteredReport.bind(controller));
  reportRouter.get(
    '/individual/:id',
    authMiddleware,
    controller.getIndividualReport.bind(controller)
  );
  reportRouter.get('/:status', authMiddleware, controller.getFilteredReport.bind(controller));

  app.use('/reports', reportRouter);
}
