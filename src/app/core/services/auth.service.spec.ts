import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
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
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: false
    };

    service.login(credentials).subscribe(user => {
      expect(user).toBeTruthy();
      expect(user.email).toBe('test@example.com');
      expect(service.isAuthenticated()).toBeTruthy();
      done();
    });
  });

  it('should store user in localStorage when rememberMe is true', (done) => {
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
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true
    };

    service.login(credentials).subscribe(() => {
      expect(service.isAuthenticated()).toBeTruthy();
      
      service.logout();
      
      expect(service.isAuthenticated()).toBeFalsy();
      expect(localStorage.getItem('currentUser')).toBeNull();
      done();
    });
  });

  it('should return current user', (done) => {
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
});
