import type { ServiceOrder } from '../entities/ServiceOrder';

export interface ServiceOrderRepository {
  getAll(): Promise<ServiceOrder[]>;
  getById(id: number): Promise<ServiceOrder | null>;
  create(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  update(id: number, serviceOrder: ServiceOrder): Promise<ServiceOrder | null>;
  delete(id: number): Promise<void>;
}
