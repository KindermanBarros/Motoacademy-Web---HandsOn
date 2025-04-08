import { ServiceOrder } from '../../domain/ServiceOrders/entities/ServiceOrder';
import type { ServiceOrderStatus } from '../../types/ServiceOrderTypes';
import type { IServiceOrderRepository } from '../../domain/ServiceOrders/repositories/IServiceOrderRepository';
import { ServiceOrderReportDTO } from '../../application/ServiceOrders/dto/ReportDTO';
import prisma from '../../client';

export class PrismaServiceOrderRepository implements IServiceOrderRepository {
  async create(serviceOrder: ServiceOrder): Promise<ServiceOrder> {
    try {
      const created = await prisma.serviceOrder.create({
        data: {
          name: serviceOrder.name.toString(),
          description: serviceOrder.description,
          userId: serviceOrder.userId,
          status: serviceOrder.status,
          scheduledAt: serviceOrder.scheduledAt
        }
      });

      return this.mapToEntity(created);
    } catch (error) {
      throw new Error('Failed to create service order');
    }
  }

  async update(
    id: number,
    serviceOrder: ServiceOrder
  ): Promise<ServiceOrder | null> {
    try {
      const updated = await prisma.serviceOrder.update({
        where: { id },
        data: {
          name: serviceOrder.name.toString(),
          description: serviceOrder.description,
          userId: serviceOrder.userId,
          status: serviceOrder.status,
          scheduledAt: serviceOrder.scheduledAt
        }
      });

      return this.mapToEntity(updated);
    } catch (error) {
      return null;
    }
  }

  async getById(id: number): Promise<ServiceOrder | null> {
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        client: true
      }
    });

    return serviceOrder ? this.mapToEntity(serviceOrder) : null;
  }

  async getAll(filters?: {
    userId?: number;
    status?: ServiceOrderStatus;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<ServiceOrder[]> {
    try {
      const where: {
        userId?: number;
        status?: ServiceOrderStatus;
        scheduledAt?: {
          gte?: Date;
          lte?: Date;
        };
      } = {};

      if (filters?.userId) {
        where.userId = filters.userId;
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.fromDate || filters?.toDate) {
        where.scheduledAt = {};
        if (filters.fromDate) {
          where.scheduledAt.gte = filters.fromDate;
        }
        if (filters.toDate) {
          where.scheduledAt.lte = filters.toDate;
        }
      }

      const serviceOrders = await prisma.serviceOrder.findMany({
        where,
        orderBy: {
          scheduledAt: 'asc'
        }
      });

      return serviceOrders.map(this.mapToEntity);
    } catch (error) {
      console.error('Repository getAll error:', error);
      return [];
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await prisma.serviceOrder.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error('Failed to delete service order');
    }
  }

  async getAllWithUserDetails(): Promise<ServiceOrderReportDTO[]> {
    const orders = await prisma.serviceOrder.findMany({
      include: {
        user: true,
        client: true
      }
    });

    return orders.map(
      (order) =>
        new ServiceOrderReportDTO(
          order.id,
          order.description,
          order.status as ServiceOrderStatus,
          order.scheduledAt,
          order.user.name,
          order.user.email,
          order.client?.name
        )
    );
  }

  private mapToEntity(data: {
    id: number;
    name: string;
    description: string;
    userId: number;
    status: string;
    scheduledAt: Date;
  }): ServiceOrder {
    return new ServiceOrder(
      data.id,
      data.name,
      data.description,
      data.userId,
      data.status as ServiceOrderStatus,
      data.scheduledAt
    );
  }
}
