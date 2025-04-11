import type { Request, Response, RequestHandler } from 'express';
import { ServiceOrder } from '../../../domain/ServiceOrders/entities/ServiceOrder';
import { CreateServiceOrder } from '../../../application/ServiceOrders/use-cases/CreateServiceOrder';
import { GetAllServiceOrders } from '../../../application/ServiceOrders/use-cases/GetAllServiceOrders';
import { GetServiceOrderById } from '../../../application/ServiceOrders/use-cases/GetServiceOrderById';
import { UpdateServiceOrder } from '../../../application/ServiceOrders/use-cases/UpdateServiceOrder';
import { DeleteServiceOrder } from '../../../application/ServiceOrders/use-cases/DeleteServiceOrder';
import { PrismaServiceOrderRepository } from '../../../infrastructure/ServiceOrders/PrismaServiceOrderRepository';
import type { ServiceOrderStatus } from '../../../types/ServiceOrderTypes';
import { HttpError } from '../../shared/errors/HttpError';
import { CreateServiceOrderDTO } from '../../../application/ServiceOrders/dto/CreateServiceOrderDTO';
import { ValidationError } from '../../shared/errors/Errors';
import { parseISO, isValid } from "date-fns";

interface FilterQuery {
  status?: string;
  fromDate?: string;
  toDate?: string;
}

interface ServiceOrderFilters {
  status?: ServiceOrderStatus;
  fromDate?: Date;
  toDate?: Date;
  userId?: number;
}

export class ServiceOrderController {
  private readonly repository: PrismaServiceOrderRepository;
  private readonly createUseCase: CreateServiceOrder;
  private readonly getAllUseCase: GetAllServiceOrders;
  private readonly getByIdUseCase: GetServiceOrderById;
  private readonly updateUseCase: UpdateServiceOrder;
  private readonly deleteUseCase: DeleteServiceOrder;

  constructor() {
    this.repository = new PrismaServiceOrderRepository();
    this.createUseCase = new CreateServiceOrder(this.repository);
    this.getAllUseCase = new GetAllServiceOrders(this.repository);
    this.getByIdUseCase = new GetServiceOrderById(this.repository);
    this.updateUseCase = new UpdateServiceOrder(this.repository);
    this.deleteUseCase = new DeleteServiceOrder(this.repository);
  }

  private validateId(id: string): number {
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      throw new HttpError(400, 'Invalid ID format');
    }
    return numId;
  }

  private validateStatus(status: string): ServiceOrderStatus {
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new HttpError(400, 'Invalid status');
    }
    return status as ServiceOrderStatus;
  }

  private buildFilters(query: FilterQuery): ServiceOrderFilters {
    const filters: ServiceOrderFilters = {};

    if (query.status) {
      filters.status = this.validateStatus(query.status);
    }

    if (query.fromDate) {
      filters.fromDate = new Date(query.fromDate);
    }

    if (query.toDate) {
      filters.toDate = new Date(query.toDate);
    }

    return filters;
  }

  private buildUpdatedOrder(
    id: number,
    existing: ServiceOrder,
    updates: Partial<ServiceOrder>
  ): ServiceOrder {
    return new ServiceOrder(
      id,
      updates.name || existing.name,
      updates.description || existing.description,
      updates.userId || existing.userId,
      updates.clientId || existing.clientId,
      updates.clientName || existing.clientName,
      updates.status ? this.validateStatus(updates.status) : existing.status,
      updates.scheduledAt ? new Date(updates.scheduledAt) : existing.scheduledAt
    );
  }

  private async getClientName(clientId: number): Promise<string> {
    // Placeholder for actual implementation to fetch client name by clientId
    return 'Client Name';
  }

  create: RequestHandler = async (req: Request, res: Response) => {
    try {
      let scheduledAt: Date;

      if (typeof req.body.scheduledAt === 'string') {
        scheduledAt = parseISO(req.body.scheduledAt);
        if (!isValid(scheduledAt)) {
          throw new ValidationError("Data inválida!");
        }
      } else {
        scheduledAt = new Date(req.body.scheduledAt);
      }

      if (!req.user?.id) {
        throw new ValidationError("User ID is required");
      }

      const clientName = req.body.clientName ||
        (req.body.clientId ? await this.getClientName(req.body.clientId) : 'Unknown Client');

      const dto = new CreateServiceOrderDTO(
        req.body.name,
        req.user.id,
        req.body.clientId,
        clientName,
        scheduledAt,
        req.body.description
      );

      const result = await this.createUseCase.execute(dto);
      res.status(201).json({
        success: true,
        message: 'Service order created successfully',
        data: result
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  };

  getAll: RequestHandler = async (req: Request, res: Response) => {
    try {
      const filters = this.buildFilters(req.query);
      const serviceOrders = await this.getAllUseCase.execute(filters);
      res.json({
        message: `Found ${serviceOrders.length} service orders`,
        data: serviceOrders
      });
    } catch (error) {
      console.error('GetAll Error:', error);
      res.status(500).json({ message: 'Failed to fetch service orders' });
    }
  };

  getAllByUser: RequestHandler = async (req: Request, res: Response) => {
    try {
      const filters = {
        userId: req.user.id,
        ...this.buildFilters(req.query)
      };

      const serviceOrders = await this.getAllUseCase.execute(filters);
      res.json({
        success: true,
        message: `Found ${serviceOrders.length} service orders`,
        data: serviceOrders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch user's service orders"
      });
    }
  };

  getById: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = this.validateId(req.params.id);
      const serviceOrder = await this.getByIdUseCase.execute(id);

      if (!serviceOrder) {
        res.status(404).json({ message: `Service order #${id} not found` });
        return;
      }

      res.json({
        message: `Service order #${id} retrieved successfully`,
        data: serviceOrder
      });
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to fetch service order' });
      }
    }
  };

  update: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = this.validateId(req.params.id);
      const existing = await this.getByIdUseCase.execute(id);

      if (!existing) {
        res.status(404).json({ message: `Service order #${id} not found` });
        return;
      }

      const updatedOrder = this.buildUpdatedOrder(id, existing, req.body);
      const result = await this.updateUseCase.execute(id, updatedOrder);

      res.json({
        message: `Service order #${id} updated successfully`,
        data: result
      });
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to update service order' });
      }
    }
  };

  delete: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = this.validateId(req.params.id);
      await this.deleteUseCase.execute(id);
      res
        .status(200)
        .json({ message: `Service order #${id} deleted successfully` });
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Failed to delete service order' });
      }
    }
  };

  updateStatus: RequestHandler = async (req: Request, res: Response) => {
    try {
      const id = this.validateId(req.params.id);
      const status = this.validateStatus(req.body.status);
      const existing = await this.getByIdUseCase.execute(id);

      if (!existing) {
        res.status(404).json({ message: `Service order #${id} not found` });
        return;
      }

      existing.status = status;
      const result = await this.updateUseCase.execute(id, existing);

      res.json({
        message: `Service order #${id} status updated successfully`,
        data: result
      });
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res
          .status(500)
          .json({ message: 'Failed to update service order status' });
      }
    }
  };
}
