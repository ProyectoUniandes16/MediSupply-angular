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
