import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ServiceOrder } from '../models/api-responses';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrdersService extends ApiService {
  apiUrl: any;
  getMyOrders(): Observable<ServiceOrder[]> {
    return this.http.get<ServiceOrder[]>(`${this.apiUrl}/service-orders/my-orders`);
  }

  create(order: Omit<ServiceOrder, 'id'>): Observable<ServiceOrder> {
    return this.post<ServiceOrder>('/service-orders', order);
  }

  updateStatus(id: number, status: string): Observable<ServiceOrder> {
    return this.patch<ServiceOrder>(`/service-orders/${id}/status`, { status });
  }
  
  getDashboardClientsSummary(): Observable<any> {
    return this.get<any>('/dashboard/clients-summary');
  }

  getDashboardStatusSummary(): Observable<any> {
    return this.get<any>('/dashboard/status-summary');
  }

  getDashboardData(): Observable<any> {
    return this.get<any>('/dashboard/status-summary');
  }

  getFilteredReport(status: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/${status}`, {
      responseType: 'blob'
    });
  }

  getIndividualReport(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/individual/${id}`, {
      responseType: 'blob'
    });
  }

  getAllOrders(): Observable<ServiceOrder[]> {
    return this.http.get<ServiceOrder[]>(`${this.apiUrl}/service-orders`, {
      responseType: 'json'
    });
  }

  createOrder(order: {
    name: string;
    description: string;
    clientId: number;
    scheduledAt: string;
  }): Observable<ServiceOrder> {
    return this.post<ServiceOrder>('/service-orders', order);
  }

  updateOrder(id: number, order: Partial<ServiceOrder>): Observable<ServiceOrder> {
    return this.put<ServiceOrder>(`/service-orders/${id}`, order);
  }

  deleteOrder(id: number): Observable<void> {
    return this.delete<void>(`/service-orders/${id}`);
  }
}
