import type { Request, Response } from 'express';
import { PrismaServiceOrderRepository } from '../../../infrastructure/ServiceOrders/PrismaServiceOrderRepository';
import prisma from '../../../client';

export class DashboardController {
  private readonly repository: PrismaServiceOrderRepository;

  constructor() {
    this.repository = new PrismaServiceOrderRepository();
  }

  async getClientOrdersSummary(req: Request, res: Response) {
    try {
      const summary = await prisma.client.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: {
              serviceOrders: {
                where: {
                  userId: req.user.id
                }
              }
            }
          },
          serviceOrders: {
            where: {
              userId: req.user.id
            },
            select: {
              status: true
            }
          }
        },
        where: {
          userId: req.user.id
        }
      });

      const formattedSummary = summary.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        totalOrders: client._count.serviceOrders,
        statusBreakdown: {
          pending: client.serviceOrders.filter(o => o.status === 'pending').length,
          completed: client.serviceOrders.filter(o => o.status === 'completed').length,
          cancelled: client.serviceOrders.filter(o => o.status === 'cancelled').length
        }
      }));

      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        data: formattedSummary
      });
    } catch (error) {
      console.error('Dashboard Error:', error);

      res.status(500).setHeader('Content-Type', 'application/json');
      res.json({ 
        success: false, 
        message: 'Failed to fetch dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getStatusSummary(req: Request, res: Response) {
    try {
      const summary = await prisma.serviceOrder.groupBy({
        by: ['status'],
        where: {
          userId: req.user.id
        },
        _count: true
      });

      const formattedSummary = {
        pending: 0,
        completed: 0,
        cancelled: 0,
        total: 0
      };
      
      summary.forEach(item => {
        const status = item.status as keyof typeof formattedSummary;
        if (status in formattedSummary) {
          formattedSummary[status] = item._count;
          formattedSummary.total += item._count;
        }
      });

      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        data: formattedSummary
      });
    } catch (error) {
      res.status(500).setHeader('Content-Type', 'application/json');
      res.json({ 
        success: false, 
        message: 'Failed to fetch status summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
