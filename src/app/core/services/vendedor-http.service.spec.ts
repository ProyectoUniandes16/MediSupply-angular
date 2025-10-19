import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VendedorHttpService } from './vendedor-http.service';
import { RegistrarVendedorRequest } from '../models/vendedor.models';

describe('VendedorHttpService', () => {
  let service: VendedorHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VendedorHttpService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(VendedorHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a new vendedor', () => {
    const mockRequest: RegistrarVendedorRequest = {
      nombre: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      correo: 'juan.perez@example.com'
    };

    const mockResponse = {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com',
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    };

    service.registrarVendedor(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/vendedor');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should validate vendedor data correctly', () => {
    const validRequest: RegistrarVendedorRequest = {
      nombre: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      correo: 'juan.perez@example.com'
    };

    const result = service.validarDatosVendedor(validRequest);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should return validation errors for invalid data', () => {
    const invalidRequest: RegistrarVendedorRequest = {
      nombre: '',
      apellidos: '',
      zona: '',
      estado: '',
      telefono: '123',
      correo: 'invalid-email'
    };

    const result = service.validarDatosVendedor(invalidRequest);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
