import { Injectable } from '@angular/core';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { LoginResponse } from '../models/api-responses';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  login(email: string, password: string): Observable<LoginResponse> {
    return this.post<LoginResponse>('/users/login', { email, password }).pipe(
      tap((response) => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.post('/users/register', { name, email, password });
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  getUserId() {
    const user = this.getUser();
    return user ? user.id : null;
  }

  logout(): void {
    localStorage.clear();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
