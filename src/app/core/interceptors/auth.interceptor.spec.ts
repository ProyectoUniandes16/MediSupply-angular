import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let mockNext: HttpHandlerFn;
  let mockRequest: HttpRequest<any>;

  beforeEach(() => {
    mockNext = jasmine.createSpy('next').and.returnValue(of({} as HttpEvent<any>));
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should add Authorization header when token exists', () => {
    const token = 'test-token-123';
    localStorage.setItem('access_token', token);

    mockRequest = new HttpRequest('GET', '/api/proveedores');

    TestBed.runInInjectionContext(() => {
      authInterceptor(mockRequest, mockNext);
    });

    expect(mockNext).toHaveBeenCalled();
    const interceptedRequest = (mockNext as jasmine.Spy).calls.mostRecent().args[0];
    expect(interceptedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should not add Authorization header when token does not exist', () => {
    mockRequest = new HttpRequest('GET', '/api/proveedores');

    TestBed.runInInjectionContext(() => {
      authInterceptor(mockRequest, mockNext);
    });

    expect(mockNext).toHaveBeenCalled();
    const interceptedRequest = (mockNext as jasmine.Spy).calls.mostRecent().args[0];
    expect(interceptedRequest.headers.has('Authorization')).toBe(false);
  });

  it('should not add Authorization header for login requests', () => {
    const token = 'test-token-123';
    localStorage.setItem('access_token', token);

    mockRequest = new HttpRequest('POST', '/api/auth/login', { email: 'test@test.com', password: 'pass' });

    TestBed.runInInjectionContext(() => {
      authInterceptor(mockRequest, mockNext);
    });

    expect(mockNext).toHaveBeenCalled();
    const interceptedRequest = (mockNext as jasmine.Spy).calls.mostRecent().args[0];
    expect(interceptedRequest.headers.has('Authorization')).toBe(false);
  });

  it('should pass request unchanged when no token and not login', () => {
    mockRequest = new HttpRequest('GET', '/api/proveedores');

    TestBed.runInInjectionContext(() => {
      const result = authInterceptor(mockRequest, mockNext);
    });

    expect(mockNext).toHaveBeenCalledWith(mockRequest);
  });

  it('should handle requests with existing headers', () => {
    const token = 'test-token-123';
    localStorage.setItem('access_token', token);

    mockRequest = new HttpRequest('GET', '/api/proveedores');
    mockRequest = mockRequest.clone({
      setHeaders: { 'Content-Type': 'application/json' }
    });

    TestBed.runInInjectionContext(() => {
      authInterceptor(mockRequest, mockNext);
    });

    const interceptedRequest = (mockNext as jasmine.Spy).calls.mostRecent().args[0];
    expect(interceptedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(interceptedRequest.headers.get('Content-Type')).toBe('application/json');
  });
});
