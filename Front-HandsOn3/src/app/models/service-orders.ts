export interface IServiceOrders {
  id?: number;
  name: string;
  clientId: number;
  scheduledAt: string;
  description: string;
  status?: string;
  client?: {
    id: number;
    name: string;
  };
}

export interface newOrders {
  name: string;
  clientId: number;
  scheduledAt: string;
  description: string;
}