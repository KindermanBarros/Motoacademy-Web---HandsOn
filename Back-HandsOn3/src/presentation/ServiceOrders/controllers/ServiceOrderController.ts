import type { Request, Response } from 'express';
import { PrismaServiceOrderRepository } from '../../../infrastructure/ServiceOrders/PrismaServiceOrderRepository';
import { CreateServiceOrder } from '../../../application/ServiceOrders/use-cases/CreateServiceOrder';
import { GetAllServiceOrders } from '../../../application/ServiceOrders/use-cases/GetAllServiceOrders';
import { GetServiceOrderById } from '../../../application/ServiceOrders/use-cases/GetServiceOrderById';
import { UpdateServiceOrder } from '../../../application/ServiceOrders/use-cases/UpdateServiceOrder';
import { DeleteServiceOrder } from '../../../application/ServiceOrders/use-cases/DeleteServiceOrder';
import { ServiceOrder } from '../../../domain/ServiceOrders/entities/ServiceOrder';
import { CreateServiceOrderDTO } from '../../../application/ServiceOrders/dto/CreateServiceOrderDTO';
import { UpdateServiceOrderDTO } from '../../../application/ServiceOrders/dto/UpdateServiceOrderDTO';
import { ServiceOrderDTO } from '../../../application/ServiceOrders/dto/ServiceOrderDTO';

const serviceOrderRepository = new PrismaServiceOrderRepository();
const createServiceOrder = new CreateServiceOrder(serviceOrderRepository);
const getAllServiceOrders = new GetAllServiceOrders(serviceOrderRepository);
const getServiceOrderById = new GetServiceOrderById(serviceOrderRepository);
const updateServiceOrder = new UpdateServiceOrder(serviceOrderRepository);
const deleteServiceOrder = new DeleteServiceOrder(serviceOrderRepository);

export class ServiceOrderController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const orders = await getAllServiceOrders.execute();
      const orderDTOs = orders.map(
        (order) =>
          new ServiceOrderDTO(order.id, order.description, order.userId)
      );
      res.status(200).json(orderDTOs);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await getServiceOrderById.execute(Number(id));
      if (!order) {
        res.status(404).json({ message: 'Service order not found' });
        return;
      }
      const orderDTO = new ServiceOrderDTO(
        order.id,
        order.description,
        order.userId
      );
      res.status(200).json(orderDTO);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const createDTO = new CreateServiceOrderDTO(
        req.body.description,
        req.body.userId
      );
      const order = new ServiceOrder(
        0,
        createDTO.description,
        createDTO.userId
      );
      const createdOrder = await createServiceOrder.execute(order);
      const orderDTO = new ServiceOrderDTO(
        createdOrder.id,
        createdOrder.description,
        createdOrder.userId
      );
      res.status(201).json(orderDTO);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateDTO = new UpdateServiceOrderDTO(
        req.body.description,
        req.body.userId
      );
      const order = new ServiceOrder(
        Number(id),
        updateDTO.description,
        updateDTO.userId
      );
      const updatedOrder = await updateServiceOrder.execute(Number(id), order);
      if (!updatedOrder) {
        res.status(404).json({ message: 'Service order not found' });
        return;
      }
      const orderDTO = new ServiceOrderDTO(
        updatedOrder.id,
        updatedOrder.description,
        updatedOrder.userId
      );
      res.status(200).json(orderDTO);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await deleteServiceOrder.execute(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
