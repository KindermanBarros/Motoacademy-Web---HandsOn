import type { IServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/IServiceOrderRepository';

export class DeleteServiceOrder {
  constructor(private serviceOrderRepository: IServiceOrderRepository) {}

  async execute(id: number) {
    return this.serviceOrderRepository.delete(id);
  }
}
