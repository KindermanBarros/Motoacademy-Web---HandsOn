export class UpdateServiceOrderStatusDTO {
  constructor(public status: 'pending' | 'completed' | 'cancelled') {}
}
