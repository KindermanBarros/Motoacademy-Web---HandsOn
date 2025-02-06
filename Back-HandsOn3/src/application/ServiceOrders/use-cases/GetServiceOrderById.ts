import type { IServiceOrderRepository } from '../../../domain/ServiceOrders/repositories/IServiceOrderRepository';

export class GetServiceOrderById {
  constructor(private serviceOrderRepository: IServiceOrderRepository) {}

  async execute(id: number) {
    return this.serviceOrderRepository.getById(id);
  }
}
