import { Request, Response } from "express";
import { PrismaServiceOrderRepository } from "../../../infrastructure/ServiceOrders/PrismaServiceOrderRepository";
import { CreateServiceOrder } from "../../../application/ServiceOrders/use-cases/CreateServiceOrder";
import { ServiceOrder } from "../../../domain/ServiceOrders/entities/ServiceOrder";

const serviceOrderRepository = new PrismaServiceOrderRepository();
const createServiceOrder = new CreateServiceOrder(serviceOrderRepository);

export class ServiceOrderController {
  async create(req: Request, res: Response): Promise<void> {
    const { description, userId } = req.body;
    const serviceOrder = new ServiceOrder(0, description, userId);
    const createdServiceOrder = await createServiceOrder.execute(serviceOrder);
    res.status(201).json(createdServiceOrder);
  }
}
