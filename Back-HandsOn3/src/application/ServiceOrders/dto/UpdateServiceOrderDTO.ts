import type {
  BaseServiceOrderFields,
  ServiceOrderStatus
} from '../../../types/ServiceOrderTypes';

export class UpdateServiceOrderDTO implements BaseServiceOrderFields {
  constructor(
    public name: string,
    public userId: number,
    public scheduledAt: Date,
    public status: ServiceOrderStatus,
    public description?: string
  ) {}
}
