import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../testing/i18n-testing.helper';
import { PedidosComponent } from './pedidos.component';
import { VendedorHttpService } from '../../../core/services/vendedor-http.service';
import { PedidoHttpService } from '../../../core/services/pedido-http.service';
import { of, throwError } from 'rxjs';

describe('PedidosComponent', () => {
  let component: PedidosComponent;
  let fixture: ComponentFixture<PedidosComponent>;
  let vendedorService: VendedorHttpService;
  let pedidoService: PedidoHttpService;

  // Helper para evitar problemas de tipos con matchers de Jasmine
  const jexpect = (v: any) => (expect(v) as any);

  const mockVendedoresResponse = {
    items: [
      { id: 'abc-123-def', nombre: 'María', apellidos: 'González', zona: 'Colombia', estado: 'Activo', telefono: '111', correo: 'm@x.com', fechaCreacion: '', fechaActualizacion: '', usuarioCreacion: '', usuarioActualizacion: null },
      { id: 'xyz-999-kkk', nombre: 'Carlos', apellidos: 'Ruiz', zona: 'México', estado: 'Inactivo', telefono: '222', correo: 'c@x.com', fechaCreacion: '', fechaActualizacion: '', usuarioCreacion: '', usuarioActualizacion: null }
    ],
    page: 1,
    size: 100,
    total: 2
  };

  const mockPedidosResponse = {
    data: [
      { id: 1, cliente_id: 123, vendedor_id: 'abc-123-def', fecha_pedido: '2025-11-08T14:30:00.000000', estado: 'pendiente', total: 1500.5 },
      { id: 2, cliente_id: 123, vendedor_id: 'abc-123-def', fecha_pedido: '2025-11-07T10:15:00.000000', estado: 'completado', total: 2300.75 }
    ],
    page: 1,
    size: 10,
    total: 2
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PedidosComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeTranslateLoader } })
      ],
      providers: [
        TranslateService,
        { provide: VendedorHttpService, useValue: jasmine.createSpyObj('VendedorHttpService', ['obtenerVendedores']) },
        { provide: PedidoHttpService, useValue: jasmine.createSpyObj('PedidoHttpService', ['obtenerPedidos']) }
      ]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('es');

    vendedorService = TestBed.inject(VendedorHttpService);
    pedidoService = TestBed.inject(PedidoHttpService);

    (vendedorService.obtenerVendedores as jasmine.Spy).and.returnValue(of(mockVendedoresResponse));
    (pedidoService.obtenerPedidos as jasmine.Spy).and.returnValue(of(mockPedidosResponse));

    fixture = TestBed.createComponent(PedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    jexpect(component).toBeTruthy();
  });

  it('should display title and subtitle', () => {
    const el = fixture.nativeElement as HTMLElement;
    jexpect(el.querySelector('.title')?.textContent).toContain('Pedidos');
    jexpect(el.querySelector('.subtitle')?.textContent).toBeTruthy();
  });

  it('should load vendedores and pedidos on init', () => {
    jexpect(vendedorService.obtenerVendedores).toHaveBeenCalledWith({ page: 1, size: 100 });
    jexpect(pedidoService.obtenerPedidos).toHaveBeenCalled();
    jexpect(component.pedidos.length).toBe(2);
    jexpect(component.total).toBe(2);
  });

  it('should render filters bar and table when data present', () => {
    const el = fixture.nativeElement as HTMLElement;
    jexpect(el.querySelector('.filters-bar')).toBeTruthy();
    jexpect(el.querySelector('.table-container')).toBeTruthy();
    jexpect(el.querySelector('table.pedidos-table')).toBeTruthy();
  });

  it('should apply filters and reset to first page', fakeAsync(() => {
    component.page = 3;
    component.selectedVendedor = 'abc-123-def';
    component.clienteId = '123';
    component.aplicarFiltros();
    tick();

    jexpect(component.page).toBe(1);
    jexpect(pedidoService.obtenerPedidos).toHaveBeenCalledWith(jasmine.objectContaining({ vendedor_id: 'abc-123-def', cliente_id: '123', page: 1, size: 10 }));
  }));

  it('should not include cliente_id param when non-numeric value entered', fakeAsync(() => {
    // Reset spy calls to isolate this test
    (pedidoService.obtenerPedidos as jasmine.Spy).calls.reset();
    component.clienteId = 'ABC123';
    component.onSearchChange();
    tick(600); // debounce + buffer
    jexpect(pedidoService.obtenerPedidos).toHaveBeenCalled();
    const args = (pedidoService.obtenerPedidos as jasmine.Spy).calls.mostRecent().args[0];
    jexpect(args.cliente_id).toBeUndefined();
    jexpect(component.errorMessage).toContain('numérico');
  }));

  it('should clear filters', fakeAsync(() => {
    component.selectedVendedor = 'abc-123-def';
    component.clienteId = '999';
    component.limpiarFiltros();
    tick();
    jexpect(component.selectedVendedor).toBe('');
    jexpect(component.clienteId).toBe('');
    jexpect(pedidoService.obtenerPedidos).toHaveBeenCalled();
  }));

  it('should handle page change', () => {
    const newResp = { ...mockPedidosResponse, page: 2, size: 20, total: 50 };
    (pedidoService.obtenerPedidos as jasmine.Spy).and.returnValue(of(newResp));

    component.onPageChange({ pageIndex: 1, pageSize: 20, length: 50, previousPageIndex: 0 });
    jexpect(component.page).toBe(2);
    jexpect(component.size).toBe(20);
  });

  it('should show loading spinner when loading', () => {
    component.isLoading = true;
    fixture.detectChanges();
    jexpect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();
  });

  it('should show empty state when no pedidos and no filters', () => {
    component.pedidos = [];
    component.isLoading = false;
    component.errorMessage = '';
    component.selectedVendedor = '';
    component.clienteId = '';
    fixture.detectChanges();
    jexpect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });

  it('should show no-results when filtered but no data', () => {
    component.pedidos = [];
    component.isLoading = false;
    component.errorMessage = '';
    component.selectedVendedor = 'abc-123-def';
    fixture.detectChanges();
    jexpect(fixture.nativeElement.querySelector('.no-results')).toBeTruthy();
  });

  it('should handle error on load pedidos', fakeAsync(() => {
    (pedidoService.obtenerPedidos as jasmine.Spy).and.returnValue(throwError(() => ({ status: 500 })));
    component.cargarPedidos();
    tick();
    jexpect(component.errorMessage).toBeTruthy();
    jexpect(component.isLoading).toBeFalse();
  }));

  it('should compute getters correctly', () => {
    component.pedidos = mockPedidosResponse.data as any;
    jexpect(component.tienePedidos).toBeTrue();
    component.selectedVendedor = 'abc-123-def';
    jexpect(component.hasFiltrosActivos).toBeTrue();
  });
});
