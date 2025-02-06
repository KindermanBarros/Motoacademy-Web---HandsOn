export class ServiceOrder {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public userId: number,
    public status: 'pending' | 'completed' | 'cancelled',
    public scheduledAt: Date
  ) {}
}
