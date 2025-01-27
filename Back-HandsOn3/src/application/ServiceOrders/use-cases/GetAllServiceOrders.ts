import type { ServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/ServiceOrderRepository';

export class GetAllServiceOrders {
  constructor(private serviceOrderRepository: ServiceOrderRepository) {}

  async execute() {
    return this.serviceOrderRepository.getAll();
  }
}
