import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IClient } from '../models/client.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService extends ApiService {
  getClients(): Observable<IClient[]> {
    return this.get<IClient[]>('/clients');
  }

  getClientById(id: number): Observable<IClient> {
    return this.get<IClient>(`/clients/${id}`);
  }

  createClient(client: Omit<IClient, 'id'>): Observable<IClient> {
    return this.post<IClient>('/clients', client);
  }

  updateClient(id: number, client: Partial<IClient>): Observable<IClient> {
    return this.put<IClient>(`/clients/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.delete<void>(`/clients/${id}`);
  }

  searchClients(query: string): Observable<IClient[]> {
    return this.get<IClient[]>(`/clients/search?q=${query}`);
  }
}
