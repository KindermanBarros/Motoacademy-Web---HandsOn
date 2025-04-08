import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, DashboardSummary } from '../models/api-responses';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends ApiService {
  getClientOrdersSummary(): Observable<ApiResponse<DashboardSummary['clientOrdersSummary']>> {
    return this.get<ApiResponse<DashboardSummary['clientOrdersSummary']>>('/dashboard/clients-summary', { responseType: 'json' });
  }

  getStatusSummary(): Observable<ApiResponse<DashboardSummary['statusSummary']>> {
    return this.get<ApiResponse<DashboardSummary['statusSummary']>>('/dashboard/status-summary', { responseType: 'json' });
  }

  getDashboardData(): Observable<ApiResponse<DashboardSummary>> {
    return this.get<ApiResponse<DashboardSummary>>('/dashboard', { responseType: 'json' });
  }
}
