import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected baseUrl = environment.apiUrl;

  constructor(
    protected http: HttpClient,
    protected router: Router
  ) {}

  protected get<T>(path: string, options: { responseType: 'blob', observe?: 'body' }): Observable<Blob>;
  protected get<T>(path: string, options: { responseType: 'json', observe?: never }): Observable<T>;
  protected get<T>(path: string, options?: { responseType?: never, observe?: never }): Observable<T>;
  protected get<T>(path: string, options: any = {}): Observable<T | Blob> {
    const responseType = options.responseType || 'json';
    
    return this.http.get(`${this.baseUrl}${path}`, {
      ...options,
      responseType,
      observe: options.observe || 'body',
      headers: this.getHeaders(responseType)
    }).pipe(
      map(response => {
        if (responseType === 'blob') {
          return this.convertToBlob(response);
        }
        return this.extractData<T>(response);
      }),
      catchError((error) => this.handleError(error))
    );
  }

  private convertToBlob(response: any): Blob {
    if (response instanceof ArrayBuffer) {
      return new Blob([response]);
    }
    return response;
  }

  protected post<T>(path: string, body: any, options: any = {}): Observable<T> {
    const responseType = options.responseType || 'json';
    
    return this.http.post<any>(`${this.baseUrl}${path}`, body, {
      ...options,
      headers: this.getHeaders(responseType)
    }).pipe(
      map(response => this.extractData<T>(response)),
      catchError((error) => this.handleError(error))
    );
  }

  protected put<T>(path: string, body: any, options: any = {}): Observable<T> {
    const responseType = options.responseType || 'json';
    
    return this.http.put<any>(`${this.baseUrl}${path}`, body, {
      ...options,
      headers: this.getHeaders(responseType)
    }).pipe(
      map(response => this.extractData<T>(response)),
      catchError((error) => this.handleError(error))
    );
  }

  protected delete<T>(path: string, options: any = {}): Observable<T> {
    const responseType = options.responseType || 'json';
    
    return this.http.delete<any>(`${this.baseUrl}${path}`, {
      ...options,
      headers: this.getHeaders(responseType)
    }).pipe(
      map(response => this.extractData<T>(response)),
      catchError((error) => this.handleError(error))
    );
  }

  protected patch<T>(path: string, body: any, options: any = {}): Observable<T> {
    const responseType = options.responseType || 'json';
    
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, {
      ...options,
      headers: this.getHeaders(responseType)
    }).pipe(
      map((response: any) => this.extractData<T>(response)),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private getHeaders(responseType: string): HttpHeaders {
    let headers = new HttpHeaders();
    if (responseType === 'json') {
      headers = headers.set('Content-Type', 'application/json');
      headers = headers.set('Accept', 'application/json');
    }
    return headers;
  }

  protected extractData<T>(response: any): T {
    return response.data || response;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
    return throwError(() => error);
  }
}