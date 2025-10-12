import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AuthHttpService } from './auth-http.service';
import { LoginRequest, LoginResponse, User } from '../models/auth.models';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly tokenKey = 'access_token';
  private readonly userKey = 'currentUser';

  constructor(private readonly authHttpService: AuthHttpService) {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem(this.userKey);
    const savedToken = localStorage.getItem(this.tokenKey);
    
    // Solo restaurar el usuario si también existe el token
    if (savedUser && savedToken) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    } else {
      // Si falta alguno, limpiar ambos para evitar estados inconsistentes
      this.clearSession();
    }
  }

  /**
   * Inicia sesión con las credenciales proporcionadas
   * Realiza una petición HTTP al backend
   */
  login(credentials: LoginCredentials): Observable<User> {
    const loginRequest: LoginRequest = {
      email: credentials.email,
      password: credentials.password
    };

    return this.authHttpService.login(loginRequest).pipe(
      tap((response: LoginResponse) => {
        // Guardar token y usuario SIEMPRE en localStorage
        // El rememberMe se maneja a nivel de persistencia del navegador
        localStorage.setItem(this.tokenKey, response.access_token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
        
        // Actualizar el subject con el usuario actual
        this.currentUserSubject.next(response.user);
      }),
      map((response: LoginResponse) => response.user),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra la sesión del usuario actual
   */
  logout(): void {
    const token = this.getToken();
    
    if (token) {
      // Intentar hacer logout en el backend
      this.authHttpService.logout(token).subscribe({
        next: () => {
          this.clearSession();
        },
        error: (error) => {
          console.error('Logout error:', error);
          this.clearSession();
        }
      });
    } else {
      this.clearSession();
    }
  }

  /**
   * Limpia la sesión local
   */
  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null && this.getToken() !== null;
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene el token de acceso
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Valida el token actual
   */
  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    return this.authHttpService.validateToken(token).pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return throwError(() => new Error('Invalid token'));
      })
    );
  }
}
