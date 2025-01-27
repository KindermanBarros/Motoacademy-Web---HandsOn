import type { ServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/ServiceOrderRepository';

export class DeleteServiceOrder {
  constructor(private serviceOrderRepository: ServiceOrderRepository) {}

  async execute(id: number) {
    return this.serviceOrderRepository.delete(id);
  }
}
