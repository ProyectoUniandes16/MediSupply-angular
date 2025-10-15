import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductoHttpService } from './producto-http.service';
import { RegistrarProductoRequest } from '../models/producto.models';

describe('ProductoHttpService', () => {
  let service: ProductoHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductoHttpService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProductoHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a new producto', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    const mockRequest: RegistrarProductoRequest = {
      nombre: 'Producto Test',
      codigo_sku: 'SKU-001',
      categoria: 'medicamento',
      precio_unitario: 100.50,
      condiciones_almacenamiento: 'Temperatura ambiente',
      fecha_vencimiento: '2026-12-31',
      bodega: 'bodega_principal',
      lote: 'LOTE-001',
      certificaciones: [mockFile]
    };

    const mockResponse = {
      id: 1,
      ...mockRequest,
      certificaciones_urls: ['http://example.com/cert.pdf'],
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    };

    service.registrarProducto(mockRequest).subscribe(response => {
      expect(response).toBeTruthy();
      expect(response.id).toBe(1);
    });

    const req = httpMock.expectOne('/api/producto');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should validate producto data correctly', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    const validRequest: RegistrarProductoRequest = {
      nombre: 'Producto Test',
      codigo_sku: 'SKU-001',
      categoria: 'medicamento',
      precio_unitario: 100.50,
      condiciones_almacenamiento: 'Temperatura ambiente',
      fecha_vencimiento: '2026-12-31',
      bodega: 'bodega_principal',
      lote: 'LOTE-001',
      certificaciones: [mockFile]
    };

    const result = service.validarDatosProducto(validRequest);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should return validation errors for invalid data', () => {
    const invalidRequest: RegistrarProductoRequest = {
      nombre: '',
      codigo_sku: '',
      categoria: '',
      precio_unitario: 0,
      condiciones_almacenamiento: '',
      fecha_vencimiento: '',
      bodega: '',
      lote: '',
      certificaciones: []
    };

    const result = service.validarDatosProducto(invalidRequest);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should map form values to request correctly', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    const formValue = {
      nombreProducto: 'Producto Test',
      codigoSku: 'SKU-001',
      categoria: 'medicamento',
      precioUnitario: '100.50',
      condicionesAlmacenamiento: 'Temperatura ambiente',
      fechaVencimiento: '2026-12-31',
      bodega: 'bodega_principal',
      lote: 'LOTE-001'
    };

    const result = service.mapearFormularioARequest(formValue, [mockFile]);

    expect(result.nombre).toBe('Producto Test');
    expect(result.codigo_sku).toBe('SKU-001');
    expect(result.precio_unitario).toBe(100.50);
    expect(result.certificaciones.length).toBe(1);
  });
});
