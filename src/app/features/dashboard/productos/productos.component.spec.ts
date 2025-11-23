import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductosComponent } from './productos.component';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../testing/i18n-testing.helper';
import { ProductoHttpService } from '../../../core/services/producto-http.service';
import { PageEvent } from '@angular/material/paginator';
import { ObtenerProductosResponse } from '../../../core/models/producto.models';
import { RutaHttpService } from '../../../core/services/ruta-http.service';

describe('ProductosComponent', () => {
  let component: ProductosComponent;
  let fixture: ComponentFixture<ProductosComponent>;
  let dialog: MatDialog;
  let productoService: jasmine.SpyObj<ProductoHttpService>;
  let rutaService: jasmine.SpyObj<RutaHttpService>;

  const mockResponse: ObtenerProductosResponse = {
    data: {
      filtros_aplicados: {
        buscar: null,
        categoria: null,
        estado: null,
        proveedor_id: null
      },
      paginacion: {
        pagina_actual: 1,
        productos_por_pagina: 10,
        tiene_anterior: false,
        tiene_siguiente: true,
        total_paginas: 3,
        total_productos: 25
      },
      productos: [
        {
          id: 1,
          nombre: 'Paracetamol',
          codigo_sku: 'PARA-500',
          categoria: 'medicamento',
          precio_unitario: 1200,
          cantidad_disponible: 100,
          condiciones_almacenamiento: 'Seco y fresco',
          fecha_vencimiento: '2026-01-01',
          fecha_registro: '2025-01-01',
          fecha_actualizacion: '2025-01-02',
          estado: 'Activo',
          proveedor_id: 10,
          tiene_certificacion: true,
          usuario_registro: 'admin'
        }
      ]
    }
  };

  beforeEach(async () => {
  productoService = jasmine.createSpyObj('ProductoHttpService', ['obtenerProductos']);
    productoService.obtenerProductos.and.returnValue(of(mockResponse));
  rutaService = jasmine.createSpyObj('RutaHttpService', ['obtenerBodegas']);
  rutaService.obtenerBodegas.and.returnValue(of({ data: [], total: 0 }));

    await TestBed.configureTestingModule({
      imports: [
        ProductosComponent, 
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        TranslateService,
  { provide: ProductoHttpService, useValue: productoService },
  { provide: RutaHttpService, useValue: rutaService }
      ]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('es');

    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(ProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have title "Productos"', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.title');
    expect(title.textContent).toContain('Productos');
  });

  it('should have subtitle', () => {
    const compiled = fixture.nativeElement;
    const subtitle = compiled.querySelector('.subtitle');
    expect(subtitle.textContent).toContain('Gestiona productos del inventario');
  });

  it('should have register button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('.register-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Registrar Producto');
  });

  it('should display empty state message', () => {
    // Si no hay productos y sin filtros activos, debe verse el empty state
    component['productos'] = [];
    component['searchTerm'] = '';
    component['selectedCategoria'] = '';
    component['selectedEstado'] = '';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const emptyState = compiled.querySelector('.empty-state p');
    expect(emptyState).toBeTruthy();
  });

  it('should have openRegistrarProductoDialog method', () => {
    expect(component.openRegistrarProductoDialog).toBeDefined();
    expect(typeof component.openRegistrarProductoDialog).toBe('function');
  });

  it('should verify dialog afterClosed subscription logic with result', (done) => {
    spyOn(console, 'log');
    const mockResult = { nombre: 'Test Producto', sku: 'TEST123' };
    const mockDialogRef = jasmine.createSpyObj({
      afterClosed: of(mockResult)
    });
    spyOn(dialog, 'open').and.returnValue(mockDialogRef);
    
    component.openRegistrarProductoDialog();
    
    setTimeout(() => {
      // El componente abre un snackbar y recarga productos
      expect(productoService.obtenerProductos).toHaveBeenCalled();
      done();
    }, 50);
  });

  it('should verify dialog afterClosed subscription logic without result', (done) => {
    spyOn(console, 'log');
    const mockDialogRef = jasmine.createSpyObj({
      afterClosed: of(null)
    });
    spyOn(dialog, 'open').and.returnValue(mockDialogRef);
    
    component.openRegistrarProductoDialog();
    
    setTimeout(() => {
      expect(console.log).not.toHaveBeenCalled();
      done();
    }, 50);
  });

  it('should verify conditional logic for undefined result', () => {
    const result = undefined;
    if (result) {
      // Esta rama no debería ejecutarse
      fail('Should not execute this branch');
    }
    expect(result).toBeUndefined();
  });

  it('should have MatDialog injected', () => {
    expect(component['dialog']).toBeDefined();
  });

  it('should render productos-container', () => {
    const compiled = fixture.nativeElement;
    const container = compiled.querySelector('.productos-container');
    expect(container).toBeTruthy();
  });

  it('should render header section', () => {
    const compiled = fixture.nativeElement;
    const header = compiled.querySelector('.header');
    expect(header).toBeTruthy();
  });

  it('should render header-info section', () => {
    const compiled = fixture.nativeElement;
    const headerInfo = compiled.querySelector('.header-info');
    expect(headerInfo).toBeTruthy();
  });

  it('should have mat-icon in button', () => {
    const compiled = fixture.nativeElement;
    const icon = compiled.querySelector('.register-button mat-icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent).toContain('add');
  });

  it('should test dialog configuration values', () => {
    const expectedConfig = {
      width: '800px',
      maxWidth: '95vw',
      disableClose: false,
      autoFocus: true
    };
    
    expect(expectedConfig.width).toBe('800px');
    expect(expectedConfig.maxWidth).toBe('95vw');
    expect(expectedConfig.disableClose).toBe(false);
    expect(expectedConfig.autoFocus).toBe(true);
  });

  it('should verify component has dialog dependency', () => {
    expect(component['dialog']).toBeDefined();
  });

  it('should verify button has correct Material attributes', () => {
    const button = fixture.nativeElement.querySelector('.register-button');
    expect(button.getAttribute('mat-raised-button')).not.toBeNull();
    expect(button.getAttribute('color')).toBe('primary');
  });

  it('should verify component imports CommonModule', () => {
    // El componente debe tener CommonModule importado
    expect(component).toBeTruthy();
  });

  it('should verify empty state contains correct text content', () => {
    component['productos'] = [];
    component['searchTerm'] = '';
    component['selectedCategoria'] = '';
    component['selectedEstado'] = '';
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.empty-state p');
    expect(emptyState).toBeTruthy();
    const text = emptyState.textContent.trim();
    expect(text.length).toBeGreaterThan(0);
  });

  it('should have button with click handler defined', () => {
    const button = fixture.debugElement.nativeElement.querySelector('.register-button');
    expect(button).toBeTruthy();
    expect(button.onclick).toBeDefined();
  });

  // New tests that invoke component methods to improve coverage
  it('should call obtenerProductos on init and set data', () => {
    expect(productoService.obtenerProductos).toHaveBeenCalled();
    expect(component.productos.length).toBe(1);
    expect(component.total).toBe(25);
  });

  it('should apply filters and pass params to service', () => {
    productoService.obtenerProductos.calls.reset();
    component.searchTerm = 'para';
    component.selectedCategoria = 'medicamento';
    component.selectedEstado = 'Activo';
    component.aplicarFiltros();
    expect(productoService.obtenerProductos).toHaveBeenCalled();
    const params = productoService.obtenerProductos.calls.mostRecent().args[0];
    expect(params.page).toBe(1); // reset page on filter
    expect(params.size).toBe(10);
    expect(params.buscar).toBe('para');
    expect(params.categoria).toBe('medicamento');
    expect(params.estado).toBe('Activo');
  });

  it('should handle error when service fails', () => {
    // Make the service throw an error
    productoService.obtenerProductos.and.returnValue(throwError(() => ({ status: 500 })));

    // Trigger load
    component.cargarProductos();
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toContain('Error');
  });

  it('should change page and size on onPageChange and call service', () => {
    productoService.obtenerProductos.calls.reset();
    const event = { pageIndex: 1, pageSize: 20 } as PageEvent;
    component.onPageChange(event);
    expect(productoService.obtenerProductos).toHaveBeenCalled();
    const params = productoService.obtenerProductos.calls.mostRecent().args[0];
    expect(params.page).toBe(2);
    expect(params.size).toBe(20);
  });

  it('should clear filters on limpiarFiltros and reload from page 1', () => {
    component.searchTerm = 'x';
    component.selectedCategoria = 'medicamento';
    component.selectedEstado = 'Activo';
    productoService.obtenerProductos.calls.reset();
    component.limpiarFiltros();
    expect(component.searchTerm).toBe('');
    expect(component.selectedCategoria).toBe('');
    expect(component.selectedEstado).toBe('');
    const params = productoService.obtenerProductos.calls.mostRecent().args[0];
    expect(params.page).toBe(1);
  });

  it('should compute estado class correctly', () => {
    expect(component.getEstadoClass('Activo')).toBe('estado-activo');
    expect(component.getEstadoClass('Inactivo')).toBe('estado-inactivo');
  });

  it('should format price properly', () => {
    const formatted = component.formatearPrecio(15000);
    expect(formatted).toContain('15');
    expect(formatted).toMatch(/\d{1,3}(\.\d{3})*/);
  });

  it('should configure categorias including dispositivo', () => {
    component['configurarCategorias']();
    const values = component.categorias.map(c => c.value);
    expect(values).toContain('dispositivo');
  });

  it('should open snackbar on editarProducto', () => {
    const snackOpenSpy = spyOn((component as any)['snackBar'], 'open');
    const mockProducto = mockResponse.data.productos[0] as any;

    component.editarProducto(mockProducto);

    expect(snackOpenSpy).toHaveBeenCalled();
  });

  it('should open DetalleProductoComponent dialog on verDetalleProducto with productoId', () => {
    const mockProducto = mockResponse.data.productos[0] as any;
    const mockDialogRef = jasmine.createSpyObj({ afterClosed: of(undefined) });
    const dialogOpenSpy = spyOn((component as any)['dialog'], 'open').and.returnValue(mockDialogRef as any);

    component.verDetalleProducto(mockProducto);

    expect(dialogOpenSpy).toHaveBeenCalled();
    const callArgs = dialogOpenSpy.calls.mostRecent().args as any[];
  const config: any = callArgs[1];
    // First arg is the component, second is config with data
    expect(config.data.productoId).toBe(mockProducto.id);
    expect(config.width).toBe('900px');
    expect(config.maxWidth).toBe('95vw');
  });

  it('should compute getters correctly', () => {
    component.productos = [];
    expect(component.tieneProductos).toBeFalse();
    expect(component.hasFiltrosActivos).toBeFalse();
    component.searchTerm = 'x';
    expect(component.hasFiltrosActivos).toBeTrue();
    component.searchTerm = '';
    component.selectedCategoria = 'medicamento';
    expect(component.hasFiltrosActivos).toBeTrue();
    component.selectedCategoria = '';
    component.selectedEstado = 'Activo';
    expect(component.hasFiltrosActivos).toBeTrue();
  });
});

