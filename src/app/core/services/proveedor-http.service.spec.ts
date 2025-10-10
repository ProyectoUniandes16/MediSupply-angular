import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProveedorHttpService } from './proveedor-http.service';
import {
  RegistrarProveedorRequest,
  RegistrarProveedorResponse,
  Proveedor
} from '../models/proveedor.models';
import { environment } from '../../../environments/environment';

describe('ProveedorHttpService', () => {
  let service: ProveedorHttpService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl || '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProveedorHttpService]
    });
    service = TestBed.inject(ProveedorHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registrarProveedor', () => {
    it('debería registrar un nuevo proveedor con certificaciones', () => {
      const mockFile = new File([''], 'certificacion.pdf', { type: 'application/pdf' });
      const request: RegistrarProveedorRequest = {
        nombre: 'Proveedor Test',
        nit: '900123456',
        pais: 'Colombia',
        direccion: 'Calle 123 #45-67',
        nombre_contacto: 'Juan Pérez',
        email: 'test@proveedor.com',
        telefono: '3001234567',
        certificaciones: [mockFile]
      };

      const mockResponse: RegistrarProveedorResponse = {
        id: 1,
        nombre: 'Proveedor Test',
        nit: '900123456',
        pais: 'Colombia',
        direccion: 'Calle 123 #45-67',
        nombre_contacto: 'Juan Pérez',
        email: 'test@proveedor.com',
        telefono: '3001234567',
        certificaciones_urls: ['http://example.com/cert1.pdf'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      service.registrarProveedor(request).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.id).toBe(1);
        expect(response.nombre).toBe('Proveedor Test');
      });

      const req = httpMock.expectOne(`${apiUrl}/proveedores/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTruthy();
      req.flush(mockResponse);
    });

    it('debería manejar errores al registrar proveedor', () => {
      const mockFile = new File([''], 'certificacion.pdf', { type: 'application/pdf' });
      const request: RegistrarProveedorRequest = {
        nombre: 'Proveedor Test',
        nit: '900123456',
        pais: 'Colombia',
        direccion: 'Calle 123 #45-67',
        nombre_contacto: 'Juan Pérez',
        email: 'test@proveedor.com',
        telefono: '3001234567',
        certificaciones: [mockFile]
      };

      service.registrarProveedor(request).subscribe({
        next: () => fail('debería haber fallado'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/proveedores/`);
      req.flush('Error al registrar', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('obtenerProveedores', () => {
    it('debería obtener la lista de proveedores', () => {
      const mockProveedores: Proveedor[] = [
        {
          id: 1,
          nombre: 'Proveedor 1',
          nit: '900123456',
          pais: 'Colombia',
          direccion: 'Calle 123',
          nombre_contacto: 'Juan',
          email: 'juan@test.com',
          telefono: '3001234567',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      service.obtenerProveedores().subscribe(proveedores => {
        expect(proveedores).toEqual(mockProveedores);
        expect(proveedores.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/proveedores/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProveedores);
    });
  });

  describe('obtenerProveedorPorId', () => {
    it('debería obtener un proveedor por ID', () => {
      const mockProveedor: Proveedor = {
        id: 1,
        nombre: 'Proveedor 1',
        nit: '900123456',
        pais: 'Colombia',
        direccion: 'Calle 123',
        nombre_contacto: 'Juan',
        email: 'juan@test.com',
        telefono: '3001234567',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      service.obtenerProveedorPorId(1).subscribe(proveedor => {
        expect(proveedor).toEqual(mockProveedor);
        expect(proveedor.id).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/proveedores/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProveedor);
    });
  });

  describe('actualizarProveedor', () => {
    it('debería actualizar un proveedor existente', () => {
      const updateData: Partial<RegistrarProveedorRequest> = {
        nombre: 'Proveedor Actualizado',
        email: 'nuevo@email.com'
      };

      const mockResponse: RegistrarProveedorResponse = {
        id: 1,
        nombre: 'Proveedor Actualizado',
        nit: '900123456',
        pais: 'Colombia',
        direccion: 'Calle 123',
        nombre_contacto: 'Juan',
        email: 'nuevo@email.com',
        telefono: '3001234567',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      };

      service.actualizarProveedor(1, updateData).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.nombre).toBe('Proveedor Actualizado');
      });

      const req = httpMock.expectOne(`${apiUrl}/proveedores/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('eliminarProveedor', () => {
    it('debería eliminar un proveedor', () => {
      service.eliminarProveedor(1).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/proveedores/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('validarDatosProveedor', () => {
    it('debería validar correctamente datos válidos', () => {
      const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB

      const validData: RegistrarProveedorRequest = {
        nombre: 'Proveedor Test',
        nit: '900123456',
        pais: 'Colombia',
        direccion: 'Calle 123 #45-67',
        nombre_contacto: 'Juan Pérez',
        email: 'test@proveedor.com',
        telefono: '3001234567',
        certificaciones: [mockFile]
      };

      const result = service.validarDatosProveedor(validData);
      expect(result.valid).toBeTruthy();
      expect(result.errors.length).toBe(0);
    });

    it('debería detectar NIT inválido', () => {
      const mockFile = new File([''], 'cert.pdf', { type: 'application/pdf' });
      const invalidData: RegistrarProveedorRequest = {
        nombre: 'Proveedor Test',
        nit: '123', // NIT muy corto
        pais: 'Colombia',
        direccion: 'Calle 123',
        nombre_contacto: 'Juan',
        email: 'test@email.com',
        telefono: '3001234567',
        certificaciones: [mockFile]
      };

      const result = service.validarDatosProveedor(invalidData);
      expect(result.valid).toBeFalsy();
      expect(result.errors).toContain('El NIT debe tener entre 9 y 10 dígitos');
    });

    it('debería detectar email inválido', () => {
      const mockFile = new File([''], 'cert.pdf', { type: 'application/pdf' });
      const invalidData: RegistrarProveedorRequest = {
        nombre: 'Proveedor Test',
        nit: '900123456',
        pais: 'Colombia',
        direccion: 'Calle 123',
        nombre_contacto: 'Juan',
        email: 'email-invalido', // Email sin @
        telefono: '3001234567',
        certificaciones: [mockFile]
      };

      const result = service.validarDatosProveedor(invalidData);
      expect(result.valid).toBeFalsy();
      expect(result.errors).toContain('El email no es válido');
    });

    it('debería detectar archivo muy grande', () => {
      const mockFile = new File([''], 'cert.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'size', { value: 6 * 1024 * 1024 }); // 6MB
      Object.defineProperty(mockFile, 'name', { value: 'cert.pdf' });

      const invalidData: RegistrarProveedorRequest = {
        nombre: 'Proveedor Test',
        nit: '900123456',
        pais: 'Colombia',
        direccion: 'Calle 123',
        nombre_contacto: 'Juan',
        email: 'test@email.com',
        telefono: '3001234567',
        certificaciones: [mockFile]
      };

      const result = service.validarDatosProveedor(invalidData);
      expect(result.valid).toBeFalsy();
      expect(result.errors.some(e => e.includes('excede el tamaño máximo'))).toBeTruthy();
    });

    it('debería detectar tipo de archivo inválido', () => {
      const mockFile = new File([''], 'cert.txt', { type: 'text/plain' });
      Object.defineProperty(mockFile, 'name', { value: 'cert.txt' });

      const invalidData: RegistrarProveedorRequest = {
        nombre: 'Proveedor Test',
        nit: '900123456',
        pais: 'Colombia',
        direccion: 'Calle 123',
        nombre_contacto: 'Juan',
        email: 'test@email.com',
        telefono: '3001234567',
        certificaciones: [mockFile]
      };

      const result = service.validarDatosProveedor(invalidData);
      expect(result.valid).toBeFalsy();
      expect(result.errors.some(e => e.includes('no es un formato válido'))).toBeTruthy();
    });

    it('debería aceptar NIT con guiones', () => {
      const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });

      const validData: RegistrarProveedorRequest = {
        nombre: 'Proveedor Test',
        nit: '900-123-456', // NIT con guiones
        pais: 'Colombia',
        direccion: 'Calle 123',
        nombre_contacto: 'Juan',
        email: 'test@email.com',
        telefono: '3001234567',
        certificaciones: [mockFile]
      };

      const result = service.validarDatosProveedor(validData);
      expect(result.valid).toBeTruthy();
      expect(result.errors.length).toBe(0);
    });
  });

  describe('mapearFormularioARequest', () => {
    it('debería mapear correctamente los campos del formulario', () => {
      const mockFile = new File([''], 'cert.pdf', { type: 'application/pdf' });
      const formValue = {
        nombreProveedor: 'Proveedor ABC',
        nit: '900123456',
        pais: 'Colombia',
        estado: 'activo',
        direccion: 'Calle 123',
        nombreContacto: 'Juan Pérez',
        email: 'test@email.com',
        telefono: '3001234567'
      };

      const result = service.mapearFormularioARequest(formValue, [mockFile]);

      expect(result.nombre).toBe('Proveedor ABC');
      expect(result.nombre_contacto).toBe('Juan Pérez');
      expect(result.certificaciones.length).toBe(1);
      expect(result.certificaciones[0]).toBe(mockFile);
    });
  });
});
