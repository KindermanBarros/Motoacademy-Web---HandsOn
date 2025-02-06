import type { ServiceOrder } from '../entities/ServiceOrder';
import type { ServiceOrderStatus } from '../../../types/ServiceOrderTypes';
import type { ServiceOrderReportDTO } from '../../../application/ServiceOrders/dto/ReportDTO';

export interface IServiceOrderRepository {
  create(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  update(id: number, serviceOrder: ServiceOrder): Promise<ServiceOrder | null>;
  getById(id: number): Promise<ServiceOrder | null>;
  getAll(filters?: {
    status?: ServiceOrderStatus;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<ServiceOrder[]>;
  delete(id: number): Promise<void>;
  getAllWithUserDetails(): Promise<ServiceOrderReportDTO[]>;
}
