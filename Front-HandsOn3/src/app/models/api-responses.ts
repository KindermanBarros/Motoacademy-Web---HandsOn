export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: string;
}

export interface ClientOrderSummary {
  id: string;
  name: string;
  totalOrders: number;
}

export interface StatusSummaryData {
  completed: number;
  scheduled: number;
  cancelled: number;
}

export interface DashboardSummary {
  clientOrdersSummary: ClientOrderSummary[];
  statusSummary: Record<string, StatusSummaryData>;
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
