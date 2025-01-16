import { ServiceOrder } from "../entities/ServiceOrder";

export interface ServiceOrderRepository {
  create(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
}
