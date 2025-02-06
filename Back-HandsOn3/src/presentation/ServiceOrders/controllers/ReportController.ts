import type { Request, Response } from 'express';
import { ReportService } from '../../../application/ServiceOrders/use-cases/ReportService';
import { PrismaServiceOrderRepository } from '../../../infrastructure/ServiceOrders/PrismaServiceOrderRepository';
import { PrismaUserRepository } from '../../../infrastructure/Users/PrismaUserRepository';

const reportService = new ReportService(
  new PrismaServiceOrderRepository(),
  new PrismaUserRepository()
);

export class ReportController {
  async getIndividualReport(req: Request, res: Response): Promise<void> {
    try {
      const orderId = Number(req.params.id);
      if (Number.isNaN(orderId)) {
        res.status(400).json({ message: 'Invalid order ID' });
        return;
      }

      const pdfBuffer = await reportService.generateIndividualReport(orderId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=order-${orderId}.pdf`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Report Generation Error:', error);
      res.status(500).json({
        message:
          error instanceof Error ? error.message : 'Error generating report'
      });
    }
  }

  async getFilteredReport(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const pdfBuffer = await reportService.generateFilteredReport({ status });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=orders-${status || 'all'}.pdf`
      );
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Report Generation Error:', error);
      res.status(500).json({
        message:
          error instanceof Error ? error.message : 'Error generating report'
      });
    }
  }
}
