export class CreateServiceOrderDTO {
  constructor(
    public name: string,
    public userId: number,
    public clientId: number | null,
    public clientName: string,
    public scheduledAt: Date,
    public description = ''
  ) { }
}
