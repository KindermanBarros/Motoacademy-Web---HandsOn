import { ServiceOrder } from '../entities/ServiceOrder';
import { ServiceOrderStatus } from '../../../types/ServiceOrderTypes';
import { ServiceOrderReportDTO } from '../../../application/ServiceOrders/dto/ReportDTO';

export interface IServiceOrderRepository {
  create(serviceOrder: ServiceOrder): Promise<ServiceOrder>;
  update(id: number, serviceOrder: ServiceOrder): Promise<ServiceOrder | null>;
  getById(id: number): Promise<ServiceOrder | null>;
  getAll(filters?: {
    userId?: number;
    status?: ServiceOrderStatus;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<ServiceOrder[]>;
  delete(id: number): Promise<void>;
  getAllWithUserDetails(): Promise<ServiceOrderReportDTO[]>;

  getClientIdsByUserId(userId: number): Promise<number[]>;
}
