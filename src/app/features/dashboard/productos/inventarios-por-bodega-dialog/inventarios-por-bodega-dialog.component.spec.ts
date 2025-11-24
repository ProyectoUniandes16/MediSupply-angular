import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventariosPorBodegaDialogComponent } from './inventarios-por-bodega-dialog.component';
import { RutaHttpService } from '../../../../core/services/ruta-http.service';
import { ProductoHttpService } from '../../../../core/services/producto-http.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../../testing/i18n-testing.helper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DetalleProductoComponent } from '../detalle-producto/detalle-producto.component';

const jexpect = (v: any) => (expect(v) as any);

describe('InventariosPorBodegaDialogComponent', () => {
  let component: InventariosPorBodegaDialogComponent;
  let fixture: ComponentFixture<InventariosPorBodegaDialogComponent>;
  let rutaServiceSpy: jasmine.SpyObj<RutaHttpService>;
  let productoServiceSpy: jasmine.SpyObj<ProductoHttpService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<InventariosPorBodegaDialogComponent>>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    rutaServiceSpy = jasmine.createSpyObj('RutaHttpService', ['obtenerBodegas']);
    productoServiceSpy = jasmine.createSpyObj('ProductoHttpService', ['obtenerInventariosPorUbicacion']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    
    // Mock más completo del MatDialog para evitar errores con _openDialogs
    const mockDialogRef = { afterClosed: () => of(null) };
    dialogSpy.open.and.returnValue(mockDialogRef as any);
    // Mockear la propiedad _openDialogs que MatDialog usa internamente
    (dialogSpy as any)._openDialogs = [];

    rutaServiceSpy.obtenerBodegas.and.returnValue(of({
      data: [
        { id: 'id-1', nombre: 'Bodega Central', ubicacion: '10,10', created_at: '', updated_at: '' },
        { id: 'id-2', nombre: 'Bodega Norte', ubicacion: '11,11', created_at: '', updated_at: '' }
      ],
      total: 2
    }));

    productoServiceSpy.obtenerInventariosPorUbicacion.and.returnValue(of({
      inventarios: [
        { id: 'inv-1', productoId: 1, productoNombre: 'Producto A', productoSku: 'SKU-001', ubicacion: 'Bodega Central', cantidad: 50, usuarioCreacion: 'user', usuarioActualizacion: 'user', fechaCreacion: '2025-11-23T10:00:00.000000', fechaActualizacion: '2025-11-23T10:15:00.000000' },
        { id: 'inv-2', productoId: 2, productoNombre: 'Producto B', productoSku: 'SKU-002', ubicacion: 'Bodega Central', cantidad: 20, usuarioCreacion: 'user', usuarioActualizacion: 'user', fechaCreacion: '2025-11-23T10:05:00.000000', fechaActualizacion: '2025-11-23T10:20:00.000000' }
      ],
      total: 2,
      limite: 100,
      offset: 0
    }));

    await TestBed.configureTestingModule({
      imports: [
        InventariosPorBodegaDialogComponent,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeTranslateLoader } })
      ],
      providers: [
        { provide: RutaHttpService, useValue: rutaServiceSpy },
        { provide: ProductoHttpService, useValue: productoServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatDialog, useValue: dialogSpy },
        MatSnackBar,
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventariosPorBodegaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    jexpect(component).toBeTruthy();
  });

  it('should load bodegas on init', () => {
    jexpect(rutaServiceSpy.obtenerBodegas).toHaveBeenCalled();
    jexpect(component.bodegas.length).toBe(2);
  });

  it('should consult inventories after selecting bodega', () => {
    component.selectedBodega = 'Bodega Central';
    component.consultarInventarios();
    jexpect(productoServiceSpy.obtenerInventariosPorUbicacion).toHaveBeenCalledWith('Bodega Central');
    jexpect(component.inventarios.length).toBe(2);
  });

  it('should show error message when service fails', () => {
    productoServiceSpy.obtenerInventariosPorUbicacion.and.returnValue(throwError(() => new Error('fail')));
    component.selectedBodega = 'Bodega Central';
    component.consultarInventarios();
    // La clave de traducción cuando no está configurada adecuadamente
    jexpect(component.errorMessage).toBe('PRODUCTOS.INVENTORY_BY_WAREHOUSE.ERROR_LOADING');
    jexpect(component.isLoadingInventarios).toBeFalse();
  });

  it('should close dialog', () => {
    component.cerrar();
    jexpect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should have verDetalleProducto method defined', () => {
    jexpect(component.verDetalleProducto).toBeDefined();
    jexpect(typeof component.verDetalleProducto).toBe('function');
  });

  it('should call limpiarFiltro and clear all data', () => {
    component.selectedBodega = 'Bodega Central';
    component.inventarios = [{ id: 'inv-1', productoId: 1, productoNombre: 'Producto A', productoSku: 'SKU-001', ubicacion: 'Bodega Central', cantidad: 50, usuarioCreacion: 'user', usuarioActualizacion: 'user', fechaCreacion: '2025-11-23T10:00:00.000000', fechaActualizacion: '2025-11-23T10:15:00.000000' }];
    component.errorMessage = 'Error';
    
    component.limpiarFiltro();
    
    jexpect(component.selectedBodega).toBe('');
    jexpect(component.inventarios.length).toBe(0);
    jexpect(component.errorMessage).toBe('');
  });
});
