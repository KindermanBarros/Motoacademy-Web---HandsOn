import { ServiceOrderRepository } from "../../../domain/ServiceOrders/repositories/ServiceOrderRepository";
import { ServiceOrder } from "../../../domain/ServiceOrders/entities/ServiceOrder";

export class CreateServiceOrder {
  constructor(private serviceOrderRepository: ServiceOrderRepository) {}

  async execute(serviceOrder: ServiceOrder) {
    return this.serviceOrderRepository.create(serviceOrder);
  }
}
