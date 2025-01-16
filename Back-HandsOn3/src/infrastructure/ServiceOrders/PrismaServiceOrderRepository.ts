import { ServiceOrderRepository } from "../../domain/ServiceOrders/repositories/ServiceOrderRepository";
import { ServiceOrder } from "../../domain/ServiceOrders/entities/ServiceOrder";
import prisma from "../prisma/client";

export class PrismaServiceOrderRepository implements ServiceOrderRepository {
  async create(serviceOrder: ServiceOrder): Promise<ServiceOrder> {
    const createdServiceOrder = await prisma.serviceOrder.create({
      data: serviceOrder,
    });
    return new ServiceOrder(
      createdServiceOrder.id,
      createdServiceOrder.description,
      createdServiceOrder.userId
    );
  }
}
