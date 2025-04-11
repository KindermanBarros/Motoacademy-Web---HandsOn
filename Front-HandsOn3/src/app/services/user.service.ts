import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser, newUser } from '../models/user';
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

  createUser(user: newUser): Observable<IUser> {
    return this.post<IUser>('/users/register', user);
  }

  updateUser(id: number, userData: Partial<IUser>): Observable<IUser> {
    // Make sure we're sending the right format of data to match backend expectations
    const updateData = {
      name: userData.name,
      email: userData.email,
      ...(userData.password ? { password: userData.password } : {})
    };

    return this.put<IUser>(`/users/${id}`, updateData);
  }

  deleteUser(id: number): Observable<void> {
    return this.delete<void>(`/users/${id}`);
  }

  getProfile(): Observable<IUser> {
    return this.get<IUser>('/users/profile');
  }
}
