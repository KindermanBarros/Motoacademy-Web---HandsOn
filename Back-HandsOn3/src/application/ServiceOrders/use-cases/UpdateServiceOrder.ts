import type { IServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/IServiceOrderRepository';
import type { ServiceOrder } from '../../../domain/ServiceOrders/entities/ServiceOrder';

export class UpdateServiceOrder {
  constructor(private serviceOrderRepository: IServiceOrderRepository) {}

  async execute(id: number, serviceOrder: ServiceOrder) {
    return this.serviceOrderRepository.update(id, serviceOrder);
  }
}
