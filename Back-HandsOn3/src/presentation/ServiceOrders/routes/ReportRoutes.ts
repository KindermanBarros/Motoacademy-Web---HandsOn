import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import type { Express } from 'express-serve-static-core';

export function setReportRoutes(app: Express): void {
  const reportRouter = Router();
  const controller = new ReportController();

  reportRouter.get('/all', controller.getFilteredReport.bind(controller));
  reportRouter.get(
    '/individual/:id',
    controller.getIndividualReport.bind(controller)
  );
  reportRouter.get('/:status', controller.getFilteredReport.bind(controller));

  app.use('/reports', reportRouter);
}
