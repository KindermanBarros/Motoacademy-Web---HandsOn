import type { ServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/ServiceOrderRepository';
import type { ServiceOrder } from '../../../domain/ServiceOrders/entities/ServiceOrder';

export class UpdateServiceOrder {
  constructor(private serviceOrderRepository: ServiceOrderRepository) {}

  async execute(id: number, serviceOrder: ServiceOrder) {
    return this.serviceOrderRepository.update(id, serviceOrder);
  }
}
