import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { LoginResponse } from '../models/login';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users/login`;
  private isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticated.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private zone: NgZone
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { email, password }).pipe(
      tap((response) => {
        if (response && response.token) {
          this.zone.run(() => {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response));
            this.isAuthenticated.next(true);
          });
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  getUserId() {
    const user = this.getUser();
    return user ? user.id : null;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.isAuthenticated.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated.value;
  }

  private hasToken(): boolean {
    const token = localStorage.getItem('token');
    const hasToken = !!token;
    return hasToken;
  }
}
