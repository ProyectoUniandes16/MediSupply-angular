/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PedidoHttpService } from './pedido-http.service';

describe('PedidoHttpService', () => {
  let service: PedidoHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PedidoHttpService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PedidoHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get pedidos without filters', () => {
    const mockResponse = {
      data: [
        { id: 1, cliente_id: 123, vendedor_id: 'abc', fecha_pedido: '2025-11-08T14:30:00.000000', estado: 'pendiente', total: 1500.5 }
      ],
      page: 1,
      size: 10,
      total: 1
    };

    service.obtenerPedidos().subscribe(res => {
      expect((res as any).data.length).toBe(1);
      expect((res as any).total).toBe(1);
    });

    const req = httpMock.expectOne('/api/pedido');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get pedidos with filters', () => {
    const params = { page: 2, size: 20, vendedor_id: 'abc-123', cliente_id: '456' };
    const mockResponse = { data: [], page: 2, size: 20, total: 0 };

    service.obtenerPedidos(params).subscribe(res => {
      expect((res as any).page).toBe(2);
      expect((res as any).size).toBe(20);
    });

    const req = httpMock.expectOne(request =>
      request.url === '/api/pedido' &&
      request.params.get('page') === '2' &&
      request.params.get('size') === '20' &&
      request.params.get('vendedor_id') === 'abc-123' &&
      request.params.get('cliente_id') === '456'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error when getting pedidos', () => {
    spyOn(console, 'error');

    service.obtenerPedidos().subscribe({
      next: () => fail('expected error'),
      error: (err) => {
        expect(err.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/pedido');
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'server error' }, { status: 500, statusText: 'Server Error' });

    expect(console.error).toHaveBeenCalled();
  });
});
