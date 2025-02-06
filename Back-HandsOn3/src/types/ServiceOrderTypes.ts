export type ServiceOrderStatus = 'pending' | 'completed' | 'cancelled';

export interface BaseServiceOrderFields {
  name: string;
  userId: number;
  scheduledAt: Date;
  description?: string;
}
