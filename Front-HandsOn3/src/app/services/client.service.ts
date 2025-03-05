import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IClient } from '../models/client.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  createClient(client: IClient): Observable<IClient> {
    return this.http.post<IClient>(this.apiUrl, client);
  }

  getClients(): Observable<IClient[]> {
    return this.http.get<IClient[]>(`${this.apiUrl}/clients/`);
  }


  getClientById(id: number): Observable<IClient> {
    return this.http.get<IClient>(`${this.apiUrl}/${id}`);
  }

  updateClient(id: number, client: { name: string; cnpj: string; email: string; }): Observable<IClient> {
    return this.http.put<IClient>(`${this.apiUrl}/clients/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clients/${id}`);
  }
}
