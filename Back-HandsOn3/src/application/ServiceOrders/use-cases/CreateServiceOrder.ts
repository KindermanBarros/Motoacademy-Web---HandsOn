import { ServiceOrder } from '../../../domain/ServiceOrders/entities/ServiceOrder';
import type { IServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/IServiceOrderRepository';
import type { CreateServiceOrderDTO } from '../dto/CreateServiceOrderDTO';
import { ValidationError } from '../../../presentation/shared/errors/Errors';

export class CreateServiceOrder {
  constructor(private serviceOrderRepository: IServiceOrderRepository) {}

  async execute(dto: CreateServiceOrderDTO): Promise<ServiceOrder> {
    this.validate(dto);

    const serviceOrder = new ServiceOrder(
      0,
      dto.name,
      dto.description || '',
      dto.userId,
      'pending',
      dto.scheduledAt
    );

    return this.serviceOrderRepository.create(serviceOrder);
  }

  private validate(dto: CreateServiceOrderDTO): void {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }
    if (!dto.userId) {
      throw new ValidationError('User ID is required');
    }
    if (!dto.scheduledAt) {
      throw new ValidationError('Schedule date is required');
    }
    if (dto.scheduledAt < new Date()) {
      throw new ValidationError('Schedule date must be in the future');
    }
  }
}
