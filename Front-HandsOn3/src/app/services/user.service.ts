import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { IUser } from '../models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createUser(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(`${this.apiUrl}/users`, user);
  }

  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(`${this.apiUrl}/users/`);
  }

  getUserById(id: number): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiUrl}/users/${id}`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  updateUser(
    id: number,
    name: string,
    email: string,
    password?: string
  ): Observable<any> {
    const body: any = { name, email };
    if (password) {
      body.password = password;
    }

    return this.http.put(`${this.apiUrl}/users/update/${id}`, body);
  }
}
