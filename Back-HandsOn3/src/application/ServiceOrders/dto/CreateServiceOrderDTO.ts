import type { BaseServiceOrderFields } from '../../../types/ServiceOrderTypes';

export class CreateServiceOrderDTO implements BaseServiceOrderFields {
  constructor(
    public name: string,
    public userId: number,
    public clientId: number,
    public scheduledAt: Date,
    public description?: string
  ) {}
}
