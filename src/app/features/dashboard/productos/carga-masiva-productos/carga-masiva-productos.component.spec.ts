import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CargaMasivaProductosComponent } from './carga-masiva-productos.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoHttpService } from '../../../../core/services/producto-http.service';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { CargaMasivaResponseOk } from '../../../../core/models/producto.models';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../../testing/i18n-testing.helper';

describe('CargaMasivaProductosComponent', () => {
  let component: CargaMasivaProductosComponent;
  let fixture: ComponentFixture<CargaMasivaProductosComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CargaMasivaProductosComponent>>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockSnackBar.open.and.returnValue({
      onAction: () => of(undefined)
    } as any);

    await TestBed.configureTestingModule({
      imports: [
        CargaMasivaProductosComponent, 
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatSnackBar, useValue: mockSnackBar },
        ProductoHttpService,
        provideHttpClient(),
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CargaMasivaProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty historial initially if no data in localStorage', () => {
    localStorage.removeItem('historialCargasProductos');
    const newComponent = new CargaMasivaProductosComponent(
      mockDialogRef, 
      TestBed.inject(ProductoHttpService),
      mockSnackBar
    );
    expect(newComponent.historialCargas.length).toBe(0);
  });

  it('should download CSV template', () => {
    spyOn(document, 'createElement').and.callThrough();
    component.descargarPlantilla();
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('should handle file selection', () => {
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const event = { target: { files: [file] } } as any;
    
    component.onFileSelected(event);
    expect(component.selectedFile).toBe(file);
  });

  it('should remove selected file', () => {
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;
    
    component.removeFile();
    expect(component.selectedFile).toBeNull();
  });

  it('should close dialog on cancel', () => {
    component.cancelar();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle successful bulk upload', () => {
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;

    const mockResponse: CargaMasivaResponseOk = {
      data: {
        envio: {
          estado: 'completado',
          mensaje: 'Importación completada',
          procesamiento: 'sincrono',
          resumen: {
            total_filas: 10,
            exitosos: 10,
            fallidos: 0
          },
          detalles_exitosos: [],
          detalles_errores: []
        },
        total: 10,
        successful: 10,
        failed: 0,
        errors: [],
        valid_rows: []
      }
    };

    const productoService = TestBed.inject(ProductoHttpService);
    spyOn(productoService, 'cargarProductosMasivo').and.returnValue(of(mockResponse));

    component.iniciarProceso();

    expect(component.historialCargas.length).toBeGreaterThan(0);
    expect(component.historialCargas[0].estado).toBe('Completado');
    expect(component.historialCargas[0].totalFilas).toBe(10);
    expect(component.historialCargas[0].productsProcesados).toBe(10);
    expect(component.historialCargas[0].errores).toBe(0);
  });

  it('should handle partial bulk upload (some errors)', () => {
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;

    const mockResponse: CargaMasivaResponseOk = {
      data: {
        envio: {
          estado: 'parcial',
          mensaje: 'Importación completada con errores',
          procesamiento: 'sincrono',
          resumen: {
            total_filas: 10,
            exitosos: 7,
            fallidos: 3
          },
          detalles_exitosos: [],
          detalles_errores: []
        },
        total: 10,
        successful: 7,
        failed: 3,
        errors: [],
        valid_rows: []
      }
    };

    const productoService = TestBed.inject(ProductoHttpService);
    spyOn(productoService, 'cargarProductosMasivo').and.returnValue(of(mockResponse));

    component.iniciarProceso();

    expect(component.historialCargas[0].estado).toBe('Parcial');
    expect(component.historialCargas[0].totalFilas).toBe(10);
    expect(component.historialCargas[0].productsProcesados).toBe(7);
    expect(component.historialCargas[0].errores).toBe(3);
  });

  it('should handle failed bulk upload', () => {
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;

    const mockError = {
      error: {
        codigo: 'ERROR_BACKEND',
        error: 'Error desde microservicio de productos',
        detail: {
          estado: 'fallido',
          mensaje: 'Importación fallida',
          procesamiento: 'sincrono',
          resumen: {
            total_filas: 50,
            exitosos: 0,
            fallidos: 50
          },
          detalles_exitosos: [],
          detalles_errores: [
            {
              fila: 2,
              sku: 'SKU-DIS-001',
              codigo: 'SKU_DUPLICADO',
              error: 'Ya existe un producto con el SKU SKU-DIS-001'
            }
          ]
        }
      }
    };

    const productoService = TestBed.inject(ProductoHttpService);
    spyOn(productoService, 'cargarProductosMasivo').and.returnValue(throwError(() => mockError));

    component.iniciarProceso();

    expect(component.historialCargas[0].estado).toBe('Fallido');
    expect(component.historialCargas[0].totalFilas).toBe(50);
    expect(component.historialCargas[0].productsProcesados).toBe(0);
    expect(component.historialCargas[0].errores).toBe(50);
  });

  it('should not start process when no file is selected (early return branch)', () => {
    const productoService = TestBed.inject(ProductoHttpService);
    spyOn(productoService, 'cargarProductosMasivo');
    const prevHistLen = component.historialCargas.length;

    component.selectedFile = null;
    component.iniciarProceso();

    expect(productoService.cargarProductosMasivo).not.toHaveBeenCalled();
    expect(component.historialCargas.length).toBe(prevHistLen);
  });


  it('should handle error without detail by using default fallbacks', () => {
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    component.selectedFile = file;

    const mockError = { error: { codigo: 'ERROR_BACKEND' } };

    const productoService = TestBed.inject(ProductoHttpService);
    spyOn(productoService, 'cargarProductosMasivo').and.returnValue(throwError(() => mockError));

    component.iniciarProceso();

    expect(component.historialCargas[0].estado).toBe('Fallido');
    expect(component.historialCargas[0].totalFilas).toBe(1);
    expect(component.historialCargas[0].productsProcesados).toBe(0);
    expect(component.historialCargas[0].errores).toBe(1);
  });

  it('should not open details when there are no error rows', () => {
    const carga = {
      documento: 'test.csv',
      fechaCargue: '18/10/2025',
      totalFilas: 1,
      productsProcesados: 1,
      errores: 0,
      estado: 'Completado' as const,
      detallesErrores: [] as any[],
      detallesExitosos: [] as any[]
    };

    component.verDetallesErrores(carga as any);
    expect(component.mostrarDetalles).toBe(false);
    expect(component.cargaSeleccionada).toBeNull();
  });

  it('should keep selectedFile unchanged on drop without files', () => {
    component.selectedFile = null;
    const event = { preventDefault: () => {}, stopPropagation: () => {}, dataTransfer: undefined } as any;
    component.onDrop(event);
    expect(component.selectedFile).toBeNull();
  });

  it('should not set selectedFile when input has no files', () => {
    component.selectedFile = null;
    const event = { target: { files: [] } } as any;
    component.onFileSelected(event);
    expect(component.selectedFile).toBeNull();
  });

  it('should early-return in exportErrores when no selected carga', () => {
    const createElSpy = spyOn(document, 'createElement');
    component.cargaSeleccionada = null;
    component.exportarErrores();
    expect(createElSpy).not.toHaveBeenCalled();
  });

  it('should export errores to CSV when there are errores', () => {
    const anchorMock = { setAttribute: () => {}, click: () => {}, style: {}, remove: () => {} } as any;
    const createElSpy = spyOn(document, 'createElement').and.returnValue(anchorMock);
  const urlSpy = spyOn(globalThis.URL, 'createObjectURL').and.returnValue('blob://test');
  spyOn(document.body, 'appendChild').and.callFake((node: any) => node);

    component.cargaSeleccionada = {
      documento: 'test.csv',
      detallesErrores: [ { fila: 1, sku: 'SKU', codigo: 'ERR', error: 'desc' } ]
    } as any;

    component.exportarErrores();

    expect(createElSpy).toHaveBeenCalledWith('a');
    expect(urlSpy).toHaveBeenCalled();
  });

  it('should export CSV header when there are zero errores (empty array)', () => {
    const anchorMock = { setAttribute: () => {}, click: () => {}, style: {}, remove: () => {} } as any;
    const createElSpy = spyOn(document, 'createElement').and.returnValue(anchorMock);
    const urlSpy = spyOn(globalThis.URL, 'createObjectURL').and.returnValue('blob://test');
    spyOn(document.body, 'appendChild').and.callFake((node: any) => node);

    component.cargaSeleccionada = {
      documento: 'test.csv',
      detallesErrores: []
    } as any;

    component.exportarErrores();

    expect(createElSpy).toHaveBeenCalledWith('a');
    expect(urlSpy).toHaveBeenCalled();
  });

  it('should handle malformed historial in localStorage gracefully', () => {
    spyOn(console, 'error');
    localStorage.setItem('historialCargasProductos', '}{invalid json');
    const comp = new CargaMasivaProductosComponent(
      mockDialogRef,
      TestBed.inject(ProductoHttpService),
      mockSnackBar
    );
    expect(comp.historialCargas.length).toBe(0);
    expect(console.error).toHaveBeenCalled();
  });

  it('should remove existing registro and ignore when not found', () => {
    const carga = {
      documento: 'a.csv',
      fechaCargue: 'now',
      totalFilas: 1,
      productsProcesados: 1,
      errores: 0,
      estado: 'Completado' as const
    } as any;
    component.historialCargas = [carga];

    component.eliminarRegistro(carga);
    expect(component.historialCargas.length).toBe(0);

    // No-op when not found
    component.eliminarRegistro(carga);
    expect(component.historialCargas.length).toBe(0);
  });

  it('should reset to historial view on volverAlHistorial', () => {
    component.mostrarDetalles = true;
    component.cargaSeleccionada = {} as any;
    component.volverAlHistorial();
    expect(component.mostrarDetalles).toBe(false);
    expect(component.cargaSeleccionada).toBeNull();
  });

  it('should set selected file on drop with files', () => {
    const file = new File(['x'], 'x.csv');
    const event = {
      preventDefault: () => {},
      stopPropagation: () => {},
      dataTransfer: { files: [file] }
    } as any;
    component.onDrop(event);
    expect(component.selectedFile).toBe(file);
  });

  it('should prevent default on dragOver', () => {
    const prevent = jasmine.createSpy('preventDefault');
    const stop = jasmine.createSpy('stopPropagation');
    component.onDragOver({ preventDefault: prevent, stopPropagation: stop } as any);
    expect(prevent).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it('should detect rows with errors', () => {
    const cargaConErrores = {
      documento: 'test.csv',
      fechaCargue: '18/10/2025',
      totalFilas: 10,
      productsProcesados: 5,
      errores: 5,
      estado: 'Parcial' as const,
      detallesErrores: [
        { fila: 2, sku: 'SKU-001', codigo: 'ERROR', error: 'Test error' }
      ]
    };

    const cargaSinErrores = {
      documento: 'test2.csv',
      fechaCargue: '18/10/2025',
      totalFilas: 10,
      productsProcesados: 10,
      errores: 0,
      estado: 'Completado' as const,
      detallesErrores: []
    };

    expect(component.tieneErrores(cargaConErrores)).toBe(true);
    expect(component.tieneErrores(cargaSinErrores)).toBe(false);
  });

  it('should show details view when clicking on row with errors', () => {
    const carga = {
      documento: 'test.csv',
      fechaCargue: '18/10/2025',
      totalFilas: 10,
      productsProcesados: 5,
      errores: 5,
      estado: 'Parcial' as const,
      detallesErrores: [
        { fila: 2, sku: 'SKU-001', codigo: 'ERROR', error: 'Test error' }
      ],
      detallesExitosos: []
    };

    component.verDetallesErrores(carga);

    expect(component.mostrarDetalles).toBe(true);
    expect(component.cargaSeleccionada).toBe(carga);
  });
});
