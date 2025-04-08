import type { ServiceOrderStatus } from '../../../types/ServiceOrderTypes';

export class ServiceOrderReportDTO {
  constructor(
    public id: number,
    public description: string,
    public status: ServiceOrderStatus,
    public scheduledAt: Date,
    public userName: string,
    public userEmail: string,
    public clientName?: string
  ) {}
}

export class ReportFilterDTO {
  constructor(
    public status?: 'pending' | 'completed' | 'cancelled',
    public fromDate?: Date,
    public toDate?: Date
  ) {}
}
