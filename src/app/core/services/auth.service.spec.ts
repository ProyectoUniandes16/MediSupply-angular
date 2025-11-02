import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AuthHttpService } from './auth-http.service';
import { of, throwError } from 'rxjs';
import { LoginResponse, User } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let authHttpServiceSpy: jasmine.SpyObj<AuthHttpService>;

  const mockUser: User = {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'test@example.com',
    rol: 'gerente',
    is_active: true,
    created_at: '2025-10-10T01:27:40.334026',
    updated_at: '2025-10-10T01:27:40.334028'
  };

  const mockLoginResponse: LoginResponse = {
    data: {
      access_token: 'test-token',
      user: mockUser
    },
    message: 'Login exitoso'
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthHttpService', ['login', 'logout', 'validateToken']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthHttpService, useValue: spy }
      ]
    });
    service = TestBed.inject(AuthService);
    authHttpServiceSpy = TestBed.inject(AuthHttpService) as jasmine.SpyObj<AuthHttpService>;
    
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated initially', () => {
    expect(service.isAuthenticated()).toBeFalsy();
  });

  it('should authenticate user on login', (done) => {
    authHttpServiceSpy.login.and.returnValue(of(mockLoginResponse));

    const credentials = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false
    };

    service.login(credentials).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.data.user.email).toBe('test@example.com');
      expect(service.isAuthenticated()).toBeTruthy();
      expect(service.getToken()).toBe('test-token');
      done();
    });
  });

  it('should store user in localStorage when rememberMe is true', (done) => {
    authHttpServiceSpy.login.and.returnValue(of(mockLoginResponse));

    const credentials = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    };

    service.login(credentials).subscribe(() => {
      const savedUser = localStorage.getItem('currentUser');
      expect(savedUser).toBeTruthy();
      done();
    });
  });

  it('should logout user', (done) => {
    authHttpServiceSpy.login.and.returnValue(of(mockLoginResponse));
    authHttpServiceSpy.logout.and.returnValue(of({}));

    const credentials = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    };

    service.login(credentials).subscribe(() => {
      expect(service.isAuthenticated()).toBeTruthy();
      
      service.logout();
      
      // Wait for async logout
      setTimeout(() => {
        expect(service.isAuthenticated()).toBeFalsy();
        expect(localStorage.getItem('currentUser')).toBeNull();
        expect(localStorage.getItem('access_token')).toBeNull();
        done();
      }, 100);
    });
  });

  it('should return current user', (done) => {
    authHttpServiceSpy.login.and.returnValue(of(mockLoginResponse));

    const credentials = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false
    };

    service.login(credentials).subscribe(() => {
      const currentUser = service.getCurrentUser();
      expect(currentUser).toBeTruthy();
      expect(currentUser?.email).toBe('test@example.com');
      done();
    });
  });

  it('should handle login error', (done) => {
    const error = { status: 401, message: 'Invalid credentials' };
    authHttpServiceSpy.login.and.returnValue(throwError(() => error));

    service.login({ email: 'test@test.com', password: 'wrong', rememberMe: false })
      .subscribe({
        next: () => fail('should have failed'),
        error: (err) => {
          expect(err).toEqual(error);
          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      });
  });

  it('should validate token successfully', (done) => {
    localStorage.setItem('access_token', 'test-token');
    authHttpServiceSpy.validateToken.and.returnValue(of({ valid: true }));

    service.validateToken().subscribe(isValid => {
      expect(isValid).toBe(true);
      done();
    });
  });
});
