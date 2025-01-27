import type { ServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/ServiceOrderRepository';

export class GetServiceOrderById {
  constructor(private serviceOrderRepository: ServiceOrderRepository) {}

  async execute(id: number) {
    return this.serviceOrderRepository.getById(id);
  }
}
