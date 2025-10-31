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

  it('should format fecha_vencimiento to DD/MM/AAAA when registering producto', () => {
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

    service.registrarProducto(mockRequest).subscribe();

    const req = httpMock.expectOne('/api/producto');
    expect(req.request.method).toBe('POST');
    
    // Verificar que el FormData contiene la fecha formateada
    const formData = req.request.body as FormData;
    expect(formData.get('fecha_vencimiento')).toBe('31/12/2026');
    expect(formData.get('fecha_vencimiento_cert')).toBe('31/12/2026');
    
    req.flush(mockResponse);
  });

  it('should validate file size and type errors in validarDatosProducto', () => {
    const bigBlob = new Uint8Array(5 * 1024 * 1024 + 10); // >5MB
    const bigFile = new File([bigBlob], 'big.dat', { type: 'application/octet-stream' });
    const wrongTypeFile = new File(['x'], 'image.gif', { type: 'image/gif' });

    const req: RegistrarProductoRequest = {
      nombre: 'X',
      codigo_sku: 'SKU',
      categoria: 'medicamento',
      precio_unitario: 10,
      condiciones_almacenamiento: 'Condiciones',
      fecha_vencimiento: '2099-12-31',
      bodega: 'principal',
      lote: 'L1',
      certificaciones: [bigFile, wrongTypeFile]
    };

    const result = service.validarDatosProducto(req);
    expect(result.valid).toBeFalse();
    expect(result.errors.some(e => e.includes('excede el tamaño máximo'))).toBeTrue();
    expect(result.errors.some(e => e.includes('no es un formato válido'))).toBeTrue();
  });

  it('should invalidate past fecha_vencimiento', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    const pastDate = '2000-01-01';
    const reqPast: RegistrarProductoRequest = {
      nombre: 'Prod', codigo_sku: 'S', categoria: 'medicamento', precio_unitario: 1,
      condiciones_almacenamiento: 'x', fecha_vencimiento: pastDate, bodega: 'b', lote: 'l', certificaciones: [mockFile]
    };
    const result = service.validarDatosProducto(reqPast);
    expect(result.valid).toBeFalse();
    expect(result.errors.some(e => e.includes('debe ser futura'))).toBeTrue();
  });

  it('should format date from string and Date via private formatearFecha', () => {
    const format = (service as any)['formatearFecha'].bind(service);
    expect(format('2026-02-03')).toBe('03/02/2026');
    const d = new Date(2027, 10, 9); // 9 Nov 2027
    expect(format(d)).toBe('09/11/2027');
  });

  it('should fetch productos with query params', () => {
    const params = { page: 2, size: 20, buscar: 'para', categoria: 'medicamento', estado: 'Activo', vacio: '' } as any;

    service.obtenerProductos(params).subscribe(resp => {
      expect(resp).toBeTruthy();
    });

    const req = httpMock.expectOne(r => r.method === 'GET' && r.url === '/api/producto');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.get('buscar')).toBe('para');
    expect(req.request.params.get('categoria')).toBe('medicamento');
    expect(req.request.params.get('estado')).toBe('Activo');
    expect(req.request.params.has('vacio')).toBeFalse();

    req.flush({
      data: {
        filtros_aplicados: { buscar: 'para', categoria: 'medicamento', estado: 'Activo', proveedor_id: null },
        paginacion: { pagina_actual: 2, productos_por_pagina: 20, tiene_anterior: true, tiene_siguiente: false, total_paginas: 1, total_productos: 1 },
        productos: []
      }
    });
  });

  it('should propagate error when obtenerProductos fails', () => {
    service.obtenerProductos({ page: 1, size: 10 }).subscribe({
      next: () => fail('should have errored'),
      error: (err) => {
        expect(err.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(r => r.method === 'GET' && r.url === '/api/producto');
    req.flush({ message: 'server error' }, { status: 500, statusText: 'Server Error' });
  });

  it('should get producto detalle by id and map response', () => {
    const mockDetalle = {
      data: {
        producto: {
          id: 7,
          nombre: 'Aspirina',
          codigo_sku: 'ASP-100',
          categoria: 'medicamento',
          precio_unitario: 2500,
          condiciones_almacenamiento: 'Seco',
          fecha_vencimiento: '2027-12-31',
          estado: 'Activo',
          proveedor_id: 5,
          inventario: { cantidad_disponible: 50, tiene_stock: true },
          certificaciones: [
            { id: 1, tipo_certificacion: 'Sanitaria', nombre_archivo: 'cert.pdf', tamano_archivo: 1024, url_descarga: 'http://x', fecha_emision: '2025-01-01', fecha_vencimiento: '2026-01-01', estado: 'Activo' }
          ],
          created_at: '2025-01-01',
          updated_at: '2025-01-02',
          usuario_registro: 'admin'
        }
      }
    };

    service.obtenerProductoPorId(7).subscribe(prod => {
      expect(prod.id).toBe(7);
      expect(prod.nombre).toBe('Aspirina');
      expect(prod.inventario.tiene_stock).toBeTrue();
      expect(prod.certificaciones.length).toBe(1);
    });

    const req = httpMock.expectOne(r => r.method === 'GET' && r.url === '/api/producto/7');
    req.flush(mockDetalle);
  });

  it('should propagate error when obtenerProductoPorId fails', () => {
    service.obtenerProductoPorId(99).subscribe({
      next: () => fail('should error'),
      error: (err) => {
        expect(err.status).toBe(404);
      }
    });

    const req = httpMock.expectOne(r => r.method === 'GET' && r.url === '/api/producto/99');
    req.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });
  });
});
