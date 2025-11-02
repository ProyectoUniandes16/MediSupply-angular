import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DetalleProductoComponent } from './detalle-producto.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ProductoHttpService } from '../../../../core/services/producto-http.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../../testing/i18n-testing.helper';
import { ProductoDetalle } from '../../../../core/models/producto.models';

describe('DetalleProductoComponent', () => {
  let component: DetalleProductoComponent;
  let fixture: ComponentFixture<DetalleProductoComponent>;
  let productoService: jasmine.SpyObj<ProductoHttpService>;

  const detalleMock: ProductoDetalle = {
    id: 1,
    nombre: 'Paracetamol',
    codigo_sku: 'PARA-500',
    categoria: 'medicamento',
    precio_unitario: 1200,
    condiciones_almacenamiento: 'Seco y fresco',
    fecha_vencimiento: '2026-01-01',
    estado: 'Activo',
    proveedor_id: 10,
    inventario: { cantidad_disponible: 100, tiene_stock: true },
    certificaciones: [
      {
        id: 1,
        tipo_certificacion: 'Sanitaria',
        nombre_archivo: 'cert1.pdf',
        tamano_archivo: 2048,
        url_descarga: 'http://example.com/cert1.pdf',
        fecha_emision: '2025-01-01',
        fecha_vencimiento: '2026-01-01',
        estado: 'Activo'
      }
    ],
    created_at: '2025-01-01',
    updated_at: '2025-01-02',
    usuario_registro: 'admin'
  } as any;

  beforeEach(async () => {
    const inventariosMock = {
      data: {
        inventarios: [
          {
            id: '81f048a9-aa6e-4a85-b730-b7a839d656f0',
            productoId: 1,
            ubicacion: 'bodega_refrigerada',
            cantidad: 350,
            usuarioCreacion: '2',
            usuarioActualizacion: '2',
            fechaCreacion: '2025-11-02T03:34:12.044373',
            fechaActualizacion: '2025-11-02T03:34:12.044373'
          }
        ],
        productoId: '1',
        source: 'cache',
        total: 1,
        totalCantidad: 350
      }
    };

    productoService = jasmine.createSpyObj('ProductoHttpService', ['obtenerProductoPorId', 'obtenerInventariosProducto']);
    productoService.obtenerProductoPorId.and.returnValue(of(detalleMock));
    productoService.obtenerInventariosProducto.and.returnValue(of(inventariosMock as any));

    await TestBed.configureTestingModule({
      imports: [
        DetalleProductoComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeTranslateLoader } })
      ],
      providers: [
        TranslateService,
        { provide: MAT_DIALOG_DATA, useValue: { productoId: 1 } },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: ProductoHttpService, useValue: productoService }
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.use('es');

    fixture = TestBed.createComponent(DetalleProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load detalle', () => {
    expect(component).toBeTruthy();
    expect(productoService.obtenerProductoPorId).toHaveBeenCalledWith(1);
    expect(component.producto?.nombre).toBe('Paracetamol');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Paracetamol');
  });

  it('should load and render inventory table', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    expect(productoService.obtenerInventariosProducto).toHaveBeenCalledWith(1);
    expect(component.inventarios.length).toBeGreaterThan(0);

    const compiled = fixture.nativeElement as HTMLElement;
    const table = compiled.querySelector('.inventarios-table');
    expect(table).toBeTruthy();
    expect(compiled.textContent).toContain('bodega_refrigerada');
    expect(compiled.textContent).toContain('350');
  });

  it('should show error message when service fails and allow retry', fakeAsync(() => {
    productoService.obtenerProductoPorId.and.returnValue(throwError(() => new Error('fail')));
    component.cargarDetalleProducto();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-message')).toBeTruthy();

    // Now switch service to success and click retry
    productoService.obtenerProductoPorId.and.returnValue(of(detalleMock));
    const retryBtn = compiled.querySelector('.error-message button') as HTMLButtonElement;
    retryBtn.click();
    tick();
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.producto-detail')).toBeTruthy();
  }));

  it('should handle inventories error gracefully', fakeAsync(() => {
    productoService.obtenerInventariosProducto.and.returnValue(throwError(() => new Error('inv error')));
    component.cargarInventarios();
    tick();
    fixture.detectChanges();

    expect(component.inventarios.length).toBe(0);
    const compiled = fixture.nativeElement as HTMLElement;
    const empty = compiled.querySelector('.no-inventarios');
    expect(empty).toBeTruthy();
  }));

  it('should format helpers correctly', () => {
    const formatted = component.formatearFecha('2025-03-01');
    expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(component.formatearPrecio(15000)).toContain('15');
    expect(component.formatearTamanoArchivo(500)).toBe('500 B');
    expect(component.formatearTamanoArchivo(4096)).toContain('KB');
  });

  it('should compute estado class', () => {
    expect(component.getEstadoClass('Activo')).toBe('estado-activo');
    expect(component.getEstadoClass('Inactivo')).toBe('estado-inactivo');
  });

  it('should render certifications table and handle download', async () => {
    const openSpy = spyOn(globalThis as any, 'open');
    await fixture.whenStable();
    fixture.detectChanges();
  const compiled = fixture.nativeElement as HTMLElement;
  expect(compiled.textContent).toContain('cert1.pdf');
  const table = compiled.querySelector('.certificaciones-table') as HTMLElement;
  const downloadBtn = table.querySelector('button[mat-icon-button]') as HTMLButtonElement;
    downloadBtn.click();
    expect(openSpy).toHaveBeenCalledWith(detalleMock.certificaciones[0].url_descarga, '_blank');
  });
});
