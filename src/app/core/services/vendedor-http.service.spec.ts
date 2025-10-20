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

  it('should get list of vendedores', () => {
    const mockResponse = [
      {
        id: 1,
        nombres: 'Juan',
        apellidos: 'Pérez',
        zona: 'Colombia',
        estado: 'Activo',
        telefono: '3001234567',
        email: 'juan.perez@example.com',
        created_at: '2025-01-01',
        updated_at: '2025-01-01'
      }
    ];

    service.obtenerVendedores().subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].nombres).toBe('Juan');
    });

    const req = httpMock.expectOne('/api/vendedor/');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error when getting vendedores', () => {
    spyOn(console, 'error');

    service.obtenerVendedores().subscribe({
      next: () => fail('expected an error'),
      error: (err) => {
        expect(err.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/vendedor/');
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'server error' }, { status: 500, statusText: 'Server Error' });

    expect(console.error).toHaveBeenCalled();
  });

  it('should get vendedor by id', () => {
    const mockResponse = {
      id: 2,
      nombres: 'Ana',
      apellidos: 'Gómez',
      zona: 'Bogotá',
      estado: 'Activo',
      telefono: '1234567',
      email: 'ana@example.com',
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    };

    service.obtenerVendedorPorId(2).subscribe(res => {
      expect(res.id).toBe(2);
      expect(res.nombres).toBe('Ana');
    });

    const req = httpMock.expectOne('/api/vendedor/2');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error when getting vendedor by id', () => {
    spyOn(console, 'error');

    service.obtenerVendedorPorId(99).subscribe({
      next: () => fail('expected an error'),
      error: (err) => {
        expect(err.status).toBe(404);
      }
    });

    const req = httpMock.expectOne('/api/vendedor/99');
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });

    expect(console.error).toHaveBeenCalled();
  });

  it('should update vendedor', () => {
    const update = { zona: 'Medellín' };
    const mockResponse = {
      id: 5,
      nombres: 'Luis',
      apellidos: 'Martínez',
      zona: 'Medellín',
      estado: 'Activo',
      telefono: '7654321',
      email: 'luis@example.com',
      created_at: '2025-01-01',
      updated_at: '2025-02-01'
    };

    service.actualizarVendedor(5, update).subscribe(res => {
      expect(res.zona).toBe('Medellín');
    });

    const req = httpMock.expectOne('/api/vendedor/5');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(update);
    req.flush(mockResponse);
  });

  it('should handle error when updating vendedor', () => {
    spyOn(console, 'error');

    service.actualizarVendedor(5, { estado: 'Inactivo' }).subscribe({
      next: () => fail('expected an error'),
      error: (err) => {
        expect(err.status).toBe(400);
      }
    });

    const req = httpMock.expectOne('/api/vendedor/5');
    expect(req.request.method).toBe('PUT');
    req.flush({ message: 'bad request' }, { status: 400, statusText: 'Bad Request' });

    expect(console.error).toHaveBeenCalled();
  });

  it('should delete vendedor', () => {
    service.eliminarVendedor(7).subscribe(res => {
      // Angular HttpClient may emit null for DELETE with no body; accept null or undefined
      expect(res === undefined || res === null).toBeTrue();
    });

    const req = httpMock.expectOne('/api/vendedor/7');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle error when deleting vendedor', () => {
    spyOn(console, 'error');

    service.eliminarVendedor(7).subscribe({
      next: () => fail('expected an error'),
      error: (err) => {
        expect(err.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/vendedor/7');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'server error' }, { status: 500, statusText: 'Server Error' });

    expect(console.error).toHaveBeenCalled();
  });

  it('should handle error when registering vendedor', () => {
    spyOn(console, 'error');
    const mockRequest: RegistrarVendedorRequest = {
      nombre: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      correo: 'juan.perez@example.com'
    };

    service.registrarVendedor(mockRequest).subscribe({
      next: () => fail('expected an error'),
      error: (err) => {
        expect(err.status).toBe(409);
      }
    });

    const req = httpMock.expectOne('/api/vendedor');
    expect(req.request.method).toBe('POST');
    req.flush({ error: 'Email ya existe' }, { status: 409, statusText: 'Conflict' });

    expect(console.error).toHaveBeenCalled();
  });

  it('should map form value to request correctly', () => {
    const formValue = {
      nombres: 'Ana',
      apellidos: 'Gómez',
      zona: 'Norte',
      estado: 'Activo',
      telefono: '123-4567',
      email: 'ana@example.com'
    } as any;

    const mapped = service.mapearFormularioARequest(formValue);
    expect(mapped).toEqual({
      nombre: 'Ana',
      apellidos: 'Gómez',
      zona: 'Norte',
      estado: 'Activo',
      telefono: '123-4567',
      correo: 'ana@example.com'
    });
  });
});
