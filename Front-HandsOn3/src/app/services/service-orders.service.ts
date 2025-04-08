import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { HttpClient } from '@angular/common/http';
import { INewOrders, IServiceOrders } from '../models/service-orders';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceOrdersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createOrder(orders: INewOrders): Observable<IServiceOrders> {
    return this.http.post<IServiceOrders>(
      `${this.apiUrl}/service-orders/`,
      orders
    );
  }

  getOrders(): Observable<IServiceOrders[]> {
    return this.http.get<IServiceOrders[]>(`${this.apiUrl}/service-orders/`);
  }

  getOrderById(id: number): Observable<IServiceOrders> {
    return this.http.get<IServiceOrders>(`${this.apiUrl}/${id}`);
  }

  updateOrder(order: IServiceOrders): Observable<IServiceOrders> {
    return this.http.put<IServiceOrders>(
      `${this.apiUrl}/service-orders/`,
      order
    );
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/service-orders/${id}`);
  }
}
