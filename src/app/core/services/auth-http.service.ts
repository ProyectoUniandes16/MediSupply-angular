import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {
  private apiUrl = environment.apiUrl || 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  /**
   * Realiza el login del usuario enviando las credenciales al backend
   * @param credentials - Credenciales del usuario (email y password)
   * @returns Observable con la respuesta del login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      credentials,
      { headers }
    );
  }

  /**
   * Cierra la sesión del usuario
   * @param token - Token de autenticación
   * @returns Observable con la respuesta del logout
   */
  logout(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      { headers }
    );
  }

  /**
   * Valida si el token es válido
   * @param token - Token de autenticación
   * @returns Observable con la respuesta de validación
   */
  validateToken(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(
      `${this.apiUrl}/auth/validate`,
      { headers }
    );
  }
}
