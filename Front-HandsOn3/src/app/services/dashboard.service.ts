import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, DashboardSummary, DashboardStatusSummary } from '../models/api-responses';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends ApiService {
  getClientOrdersSummary(): Observable<ApiResponse<DashboardSummary['clientOrdersSummary']>> {
    return this.get<ApiResponse<DashboardSummary['clientOrdersSummary']>>('/dashboard/clients-summary', { responseType: 'json' });
  }

  getStatusSummary(): Observable<ApiResponse<DashboardStatusSummary>> {
    return this.get<ApiResponse<DashboardStatusSummary>>('/dashboard/status-summary', { responseType: 'json' });
  }

  getDashboardData(): Observable<ApiResponse<DashboardSummary>> {
    return this.get<ApiResponse<DashboardSummary>>('/dashboard', { responseType: 'json' });
  }

  generateReport(): Observable<Blob> {
    return this.get<Blob>('/reports/all', { responseType: 'blob' });
  }
}
