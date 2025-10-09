import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  /**
   * Inicia sesión con las credenciales proporcionadas
   * En un entorno real, esto haría una petición HTTP al backend
   */
  login(credentials: LoginCredentials): Observable<User> {
    // Simulación de autenticación
    const user: User = {
      email: credentials.email,
      name: credentials.email.split('@')[0]
    };

    return of(user).pipe(
      delay(500), // Simular latencia de red
      tap(user => {
        this.currentUserSubject.next(user);
        if (credentials.rememberMe) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
    );
  }

  /**
   * Cierra la sesión del usuario actual
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
