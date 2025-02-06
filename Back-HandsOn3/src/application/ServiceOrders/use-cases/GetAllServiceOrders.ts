import type { ServiceOrder } from '../../../domain/ServiceOrders/entities/ServiceOrder';
import type { IServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/IServiceOrderRepository';
import type { ServiceOrderStatus } from '../../../types/ServiceOrderTypes';

export class GetAllServiceOrders {
  constructor(private serviceOrderRepository: IServiceOrderRepository) {}

  async execute(filters?: {
    status?: ServiceOrderStatus;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<ServiceOrder[]> {
    return this.serviceOrderRepository.getAll(filters);
  }
}
