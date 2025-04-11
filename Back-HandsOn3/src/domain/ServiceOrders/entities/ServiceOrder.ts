export class ServiceOrder {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public userId: number,
    public clientId: number | null,
    public clientName: string,
    public status: 'pending' | 'completed' | 'cancelled',
    public scheduledAt: Date
  ) { }
}
