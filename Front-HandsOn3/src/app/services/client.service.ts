import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IClient, newClient } from '../models/client.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  createClient(client: newClient): Observable<IClient> {
    return this.http.post<IClient>(`${this.apiUrl}/clients/`,client);
  }

  getClients(): Observable<IClient[]> {
    return this.http.get<IClient[]>(`${this.apiUrl}/clients/`);
  }


  getClientById(id: number): Observable<IClient> {
    return this.http.get<IClient>(`${this.apiUrl}/${id}`);
  }

  updateClient( client: IClient): Observable<IClient> {
    return this.http.put<IClient>(`${this.apiUrl}/clients/${client.id}`,{name:client.name, email:client.email, cnpj:client.cnpj});
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clients/${id}`);
  }
}
