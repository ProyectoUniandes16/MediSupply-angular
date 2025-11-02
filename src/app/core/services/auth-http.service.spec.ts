import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthHttpService } from './auth-http.service';
import { LoginRequest, LoginResponse } from '../models/auth.models';

describe('AuthHttpService', () => {
  let service: AuthHttpService;
  let httpMock: HttpTestingController;

  const mockLoginRequest: LoginRequest = {
    email: 'usuario@ejemplo.com',
    password: 'password123'
  };

  const mockLoginResponse: LoginResponse = {
    data: {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      user: {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'usuario@ejemplo.com',
        rol: 'gerente',
        is_active: true,
        created_at: '2025-10-10T01:27:40.334026',
        updated_at: '2025-10-10T01:27:40.334028'
      }
    },
    message: 'Login exitoso'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthHttpService]
    });
    service = TestBed.inject(AuthHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login user successfully', () => {
    service.login(mockLoginRequest).subscribe(response => {
      expect(response).toEqual(mockLoginResponse);
      expect(response.data.access_token).toBeTruthy();
      expect(response.data.user.email).toBe(mockLoginRequest.email);
    });

    const req = httpMock.expectOne(request => 
      request.url.includes('/auth/login')
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockLoginRequest);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');

    req.flush(mockLoginResponse);
  });

  it('should handle login error', () => {
    const errorMessage = 'Invalid credentials';

    service.login(mockLoginRequest).subscribe(
      () => fail('should have failed'),
      error => {
        expect(error.status).toBe(401);
        expect(error.error.message).toBe(errorMessage);
      }
    );

    const req = httpMock.expectOne(request => 
      request.url.includes('/auth/login')
    );
    req.flush({ message: errorMessage }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should logout user with token', () => {
    const token = 'test-token';

    service.logout(token).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(request => 
      request.url.includes('/auth/logout')
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

    req.flush({ message: 'Logout successful' });
  });

  it('should validate token', () => {
    const token = 'test-token';

    service.validateToken(token).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(request => 
      request.url.includes('/auth/validate')
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);

    req.flush({ valid: true });
  });
});
