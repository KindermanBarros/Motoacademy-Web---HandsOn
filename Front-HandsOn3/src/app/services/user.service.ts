import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from '../models/user';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService {
  getUsers(): Observable<IUser[]> {
    return this.get<IUser[]>('/users');
  }

  getUserById(id: number): Observable<IUser> {
    return this.get<IUser>(`/users/${id}`);
  }

  createUser(user: Omit<IUser, 'id'>): Observable<IUser> {
    return this.post<IUser>('/users', user);
  }

  updateUser(id: number, userData: Partial<IUser>): Observable<IUser> {
    return this.put<IUser>(`/users/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.delete<void>(`/users/${id}`);
  }

  searchUsers(query: string): Observable<IUser[]> {
    return this.get<IUser[]>(`/users/search?q=${query}`);
  }
}
