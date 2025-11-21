import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RutaHttpService } from './ruta-http.service';

describe('RutaHttpService', () => {
  let service: RutaHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RutaHttpService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(RutaHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get zonas with optional params', () => {
    const mockResponse = { data: [], total: 0 };

    service.obtenerZonas({ page: 1, size: 10 }).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(request => 
      request.url.endsWith('/zona') &&
      request.params.get('page') === '1' &&
      request.params.get('size') === '10'
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get zona detail by id (includes /detalle endpoint)', () => {
    const mockDetalle: any = { id: 'zona-1', bodegas: [] };

    service.obtenerDetalleZona('zona-1').subscribe(res => {
      expect(res).toEqual(mockDetalle);
    });

    const req = httpMock.expectOne(request => 
      request.url.endsWith('/zona/zona-1/detalle')
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockDetalle);
  });

  it('should get pedidos by zona', () => {
    const mockResponse = { data: [{ id: 'p1' }] };

    service.obtenerPedidosPorZona('Colombia - Bogotá').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(request => 
      request.url.endsWith('/pedido') &&
      request.params.get('zona') === 'Colombia - Bogotá'
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should post calcularRutaOptima with correct payload', () => {
    const bodega: [number, number] = [-74.0721, 4.711];
    const destinos: [number, number][] = [[-74.0445, 4.676]];
    const mockResponse = { mensaje: 'ok' };

    service.calcularRutaOptima(bodega, destinos).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(request => 
      request.url.endsWith('/ruta-optima')
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ bodega, destinos });
    req.flush(mockResponse);
  });

  it('should post obtenerRutaOptimaHTML with formato=html and return text', () => {
    const bodega: [number, number] = [-74.0721, 4.711];
    const destinos: [number, number][] = [[-74.0445, 4.676]];
    const mockHtml = '<html><body>Ruta</body></html>';

    service.obtenerRutaOptimaHTML(bodega, destinos).subscribe(res => {
      expect(res).toBe(mockHtml);
    });

    const req = httpMock.expectOne(request => 
      request.url.endsWith('/ruta-optima?formato=html')
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ bodega, destinos });
    req.flush(mockHtml);
  });

  it('should register route with correct payload', () => {
    const payload: any = {
      ruta: [
        { ubicacion: [-74.1475, 4.6165], pedido_id: 'pedido-1' }
      ],
      bodega_id: 'bodega-1',
      camion_id: 'camion-1',
      zona_id: 'zona-1',
      estado: 'iniciado'
    };

    const mockResponse = { mensaje: 'Ruta registrada exitosamente' };

    service.registrarRuta(payload).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(request => 
      request.url.endsWith('/rutas')
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });
});
