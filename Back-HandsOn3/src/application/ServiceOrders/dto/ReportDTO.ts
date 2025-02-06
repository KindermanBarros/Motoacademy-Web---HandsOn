export class ServiceOrderReportDTO {
  constructor(
    public orderId: number,
    public description: string,
    public status: string,
    public scheduledAt: Date,
    public userName: string,
    public userEmail: string
  ) {}
}

export class ReportFilterDTO {
  constructor(
    public status?: 'pending' | 'completed' | 'cancelled',
    public fromDate?: Date,
    public toDate?: Date
  ) {}
}
