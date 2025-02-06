import type {
  BaseServiceOrderFields,
  ServiceOrderStatus
} from '../../../types/ServiceOrderTypes';

export class ServiceOrderDTO implements BaseServiceOrderFields {
  constructor(
    public id: number,
    public name: string,
    public userId: number,
    public scheduledAt: Date,
    public status: ServiceOrderStatus,
    public description?: string
  ) {}
}
