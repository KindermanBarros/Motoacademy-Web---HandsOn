import { ServiceOrder } from '../../../domain/ServiceOrders/entities/ServiceOrder';
import type { IServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/IServiceOrderRepository';
import type { CreateServiceOrderDTO } from '../dto/CreateServiceOrderDTO';
import { ValidationError } from '../../../presentation/shared/errors/Errors';

export class CreateServiceOrder {
  constructor(private repository: IServiceOrderRepository) { }

  async execute(dto: CreateServiceOrderDTO): Promise<ServiceOrder> {
    this.validate(dto);

    const serviceOrder = new ServiceOrder(
      0, // ID will be assigned by the database
      dto.name,
      dto.description || '',
      dto.userId,
      dto.clientId, // Include clientId
      dto.clientName, // Use clientName from the DTO
      'pending', // Default status
      dto.scheduledAt
    );

    return this.repository.create(serviceOrder);
  }

  private validate(dto: CreateServiceOrderDTO): void {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }
    if (!dto.userId) {
      throw new ValidationError('User ID is required');
    }
    // clientId can be null or a number
    if (dto.scheduledAt < new Date()) {
      throw new ValidationError('Schedule date must be in the future');
    }
  }
}
