export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export interface DashboardSummary {
  clientOrdersSummary: {
    id: number;
    name: string;
    email: string;
    totalOrders: number;
    statusBreakdown: {
      pending: number;
      completed: number;
      cancelled: number;
    };
  }[];
  statusSummary: {
    status: string;
    _count: number;
  }[];
}

export interface ServiceOrder {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  scheduledAt: string;
  clientId: number;
  client?: {
    id: number;
    name: string;
    email: string;
  };
}
