import type { ServiceOrderRepository } from '../../domain/ServiceOrders/repositories/ServiceOrderRepository';
import { ServiceOrder } from '../../domain/ServiceOrders/entities/ServiceOrder';
import prisma from '../prisma/client';

export class PrismaServiceOrderRepository implements ServiceOrderRepository {
  async getAll(): Promise<ServiceOrder[]> {
    const orders = await prisma.serviceOrder.findMany();
    return orders.map(
      (order: ServiceOrder) =>
        new ServiceOrder(order.id, order.description, order.userId)
    );
  }

  async getById(id: number): Promise<ServiceOrder | null> {
    const order = await prisma.serviceOrder.findUnique({ where: { id } });
    if (!order) return null;
    return new ServiceOrder(order.id, order.description, order.userId);
  }

  async create(serviceOrder: ServiceOrder): Promise<ServiceOrder> {
    const created = await prisma.serviceOrder.create({
      data: serviceOrder
    });
    return new ServiceOrder(created.id, created.description, created.userId);
  }

  async update(
    id: number,
    serviceOrder: ServiceOrder
  ): Promise<ServiceOrder | null> {
    try {
      const updated = await prisma.serviceOrder.update({
        where: { id },
        data: {
          description: serviceOrder.description,
          userId: serviceOrder.userId
        }
      });
      return new ServiceOrder(updated.id, updated.description, updated.userId);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<void> {
    await prisma.serviceOrder.delete({ where: { id } });
  }
}
