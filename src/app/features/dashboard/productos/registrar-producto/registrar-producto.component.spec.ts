import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { RegistrarProductoComponent } from './registrar-producto.component';
import { ProductoHttpService } from '../../../../core/services/producto-http.service';
import { RutaHttpService } from '../../../../core/services/ruta-http.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../../testing/i18n-testing.helper';

// Nombre de la primera bodega mockeada (se envía ahora el nombre en lugar del id)
const MOCK_BODEGA_NOMBRE = 'Bodega Central CDMX';

const jexpect = (v: any) => (expect(v) as any);

describe('RegistrarProductoComponent', () => {
  let component: RegistrarProductoComponent;
  let fixture: ComponentFixture<RegistrarProductoComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<RegistrarProductoComponent>>;
  let productoServiceSpy: jasmine.SpyObj<ProductoHttpService>;
  let rutaServiceSpy: jasmine.SpyObj<RutaHttpService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    productoServiceSpy = jasmine.createSpyObj('ProductoHttpService', [
      'registrarProducto',
      'validarDatosProducto',
      'mapearFormularioARequest'
    ]);
    rutaServiceSpy = jasmine.createSpyObj('RutaHttpService', ['obtenerBodegas']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    // Mock de respuesta de bodegas
    rutaServiceSpy.obtenerBodegas.and.returnValue(of({
      data: [
        {
          id: 'd5a82834-6c23-4837-a00b-4f91cc153260',
          nombre: 'Bodega Central CDMX',
          ubicacion: '19.4326,-99.1332',
          created_at: '2025-11-23T00:06:02.582083',
          updated_at: '2025-11-23T00:06:02.582086'
        },
        {
          id: '7a8ee4fc-8b51-4be5-9755-8b010494b401',
          nombre: 'Bodega Kennedy',
          ubicacion: '4.636767,-74.140675',
          created_at: '2025-11-23T00:06:02.606108',
          updated_at: '2025-11-23T00:06:02.606109'
        }
      ],
      total: 2
    }));

    await TestBed.configureTestingModule({
      imports: [
        RegistrarProductoComponent, 
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: ProductoHttpService, useValue: productoServiceSpy },
        { provide: RutaHttpService, useValue: rutaServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        provideAnimations(),
        provideNativeDateAdapter(),
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    jexpect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    jexpect(component.productoForm).toBeDefined();
    jexpect(component.productoForm.get('nombreProducto')?.value).toBe('');
    jexpect(component.productoForm.get('codigoSku')?.value).toBe('');
  });

  it('should have required validators on critical fields', () => {
    const nombreControl = component.productoForm.get('nombreProducto');
    const skuControl = component.productoForm.get('codigoSku');
    const precioControl = component.productoForm.get('precioUnitario');

    nombreControl?.setValue('');
    skuControl?.setValue('');
    precioControl?.setValue('');

    jexpect(nombreControl?.hasError('required')).toBe(true);
    jexpect(skuControl?.hasError('required')).toBe(true);
    jexpect(precioControl?.hasError('required')).toBe(true);
  });

  it('should validate precio unitario minimum value', () => {
    const precioControl = component.productoForm.get('precioUnitario');
    
    precioControl?.setValue(0);
    jexpect(precioControl?.hasError('min')).toBe(true);

  precioControl?.setValue(10.5);
    jexpect(precioControl?.hasError('min')).toBe(false);
  });

  it('should clear a field', () => {
    component.productoForm.patchValue({ nombreProducto: 'Test' });
    
    component.clearField('nombreProducto');
    
    jexpect(component.productoForm.get('nombreProducto')?.value).toBe('');
  });

  it('should return correct error message for required field', () => {
    const nombreControl = component.productoForm.get('nombreProducto');
    nombreControl?.setValue('');
    nombreControl?.markAsTouched();

    jexpect(component.getErrorMessage('nombreProducto')).toBe('Este campo es obligatorio');
  });

  it('should return correct error message for min value', () => {
    const precioControl = component.productoForm.get('precioUnitario');
    precioControl?.setValue(0);
    precioControl?.markAsTouched();

    jexpect(component.getErrorMessage('precioUnitario')).toBe('El valor debe ser mayor a 0');
  });

  it('should add files to documentosAdjuntos', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    } as any;

    component.onFileSelected(mockEvent);

    jexpect(component.documentosAdjuntos.length).toBe(1);
    jexpect(component.documentosAdjuntos[0].nombre).toBe('cert.pdf');
  });

  it('should remove document from list', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'cert.pdf', archivo: mockFile }];

    component.eliminarDocumento(0);

    jexpect(component.documentosAdjuntos.length).toBe(0);
  });

  it('should open document in new window', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    const documento = { nombre: 'cert.pdf', archivo: mockFile };
  spyOn(globalThis, 'open');
  spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');

    component.verDocumento(documento);

    jexpect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
  jexpect(globalThis.open).toHaveBeenCalledWith('blob:test-url', '_blank');
  });

  it('should close dialog on cancel', () => {
    component.onCancel();

    jexpect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();

    jexpect(productoServiceSpy.registrarProducto).not.toHaveBeenCalled();
  });

  it('should not submit if no documents attached', () => {
    component.productoForm.patchValue({
      nombreProducto: 'Test Producto',
      codigoSku: 'SKU-001',
      categoria: 'medicamento',
      precioUnitario: 100.5,
      condicionesAlmacenamiento: 'Temp ambiente',
      fechaVencimiento: '2026-12-31',
      bodega: MOCK_BODEGA_NOMBRE,
      lote: 'LOTE-001',
      cantidadInicial: 5,
      estado: 'activo'
    });

    component.onSubmit();

    jexpect(productoServiceSpy.registrarProducto).not.toHaveBeenCalled();
  });

  it('should show snackbar when no documents attached', () => {
    const snackOpenSpy = spyOn(MatSnackBar.prototype, 'open');
    component.productoForm.patchValue({
      nombreProducto: 'Test Producto',
      codigoSku: 'SKU-001',
      categoria: 'medicamento',
      precioUnitario: 100.5,
      condicionesAlmacenamiento: 'Temp ambiente',
      fechaVencimiento: '2026-12-31',
      bodega: MOCK_BODEGA_NOMBRE,
      lote: 'LOTE-001',
      cantidadInicial: 5,
      estado: 'activo'
    });

    component.onSubmit();

    jexpect(snackOpenSpy).toHaveBeenCalled();
  });

  it('should submit successfully with valid data', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'cert.pdf', archivo: mockFile }];

    component.productoForm.patchValue({
      nombreProducto: 'Test Producto',
      codigoSku: 'SKU-001',
      categoria: 'medicamento',
      precioUnitario: 100.5,
      condicionesAlmacenamiento: 'Temp ambiente',
      fechaVencimiento: '2026-12-31',
      bodega: MOCK_BODEGA_NOMBRE,
      lote: 'LOTE-001',
      cantidadInicial: 10,
      estado: 'activo'
    });

    const mockRequest = {
      nombre: 'Test Producto',
      codigo_sku: 'SKU-001',
      categoria: 'medicamento',
      precio_unitario: 100.5,
      condiciones_almacenamiento: 'Temp ambiente',
      fecha_vencimiento: '2026-12-31',
      ubicacion: MOCK_BODEGA_NOMBRE,
      lote: 'LOTE-001',
      cantidad_inicial: 10,
      certificaciones: [mockFile]
    };

    const mockResponse = {
      id: 1,
      nombre: 'Test Producto',
      codigo_sku: 'SKU-001',
      categoria: 'medicamento',
      precio_unitario: 100.5,
      condiciones_almacenamiento: 'Temp ambiente',
      fecha_vencimiento: '2026-12-31',
      ubicacion: MOCK_BODEGA_NOMBRE,
      lote: 'LOTE-001',
      cantidad_inicial: 10,
      certificaciones_urls: ['http://example.com/cert.pdf'],
      created_at: '2025-10-14T22:00:00.000000',
      updated_at: '2025-10-14T22:00:00.000000'
    };

    productoServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    productoServiceSpy.validarDatosProducto.and.returnValue({ valid: true, errors: [] });
    productoServiceSpy.registrarProducto.and.returnValue(of(mockResponse as any));

    component.onSubmit();

    jexpect(productoServiceSpy.registrarProducto).toHaveBeenCalled();
    jexpect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should handle validation errors', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'cert.pdf', archivo: mockFile }];

    component.productoForm.patchValue({
      nombreProducto: 'Test',
      codigoSku: 'S',
      categoria: 'medicamento',
      precioUnitario: 100,
      condicionesAlmacenamiento: 'Temp',
      fechaVencimiento: '2026-12-31',
      bodega: MOCK_BODEGA_NOMBRE,
      lote: 'L',
      cantidadInicial: 1,
      estado: 'activo'
    });

    const mockRequest = {
      nombre: 'Test',
      codigo_sku: 'S',
      categoria: 'medicamento',
      precio_unitario: 100,
      condiciones_almacenamiento: 'Temp',
      fecha_vencimiento: '2026-12-31',
      ubicacion: MOCK_BODEGA_NOMBRE,
      lote: 'L',
      cantidad_inicial: 1,
      certificaciones: [mockFile]
    };

    productoServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    productoServiceSpy.validarDatosProducto.and.returnValue({
      valid: false,
      errors: ['El código SKU es muy corto']
    });

    component.onSubmit();

    jexpect(productoServiceSpy.registrarProducto).not.toHaveBeenCalled();
    jexpect(component.isLoading).toBe(false);
  });

  it('should handle 409 conflict error', (done) => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'cert.pdf', archivo: mockFile }];

    component.productoForm.patchValue({
      nombreProducto: 'Test Producto',
      codigoSku: 'SKU-001',
      categoria: 'medicamento',
      precioUnitario: 100,
      condicionesAlmacenamiento: 'Temp',
      fechaVencimiento: '2026-12-31',
      bodega: MOCK_BODEGA_NOMBRE,
      lote: 'LOTE-001',
      cantidadInicial: 2,
      estado: 'activo'
    });

    const mockRequest = {
      nombre: 'Test Producto',
      codigo_sku: 'SKU-001',
      categoria: 'medicamento',
      precio_unitario: 100,
      condiciones_almacenamiento: 'Temp',
      fecha_vencimiento: '2026-12-31',
      ubicacion: MOCK_BODEGA_NOMBRE,
      lote: 'LOTE-001',
      cantidad_inicial: 2,
      certificaciones: [mockFile]
    };

    productoServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    productoServiceSpy.validarDatosProducto.and.returnValue({ valid: true, errors: [] });
    productoServiceSpy.registrarProducto.and.returnValue(
      throwError(() => ({ status: 409, error: { error: 'SKU ya existe' } }))
    );

    component.onSubmit();

    setTimeout(() => {
      jexpect(component.isLoading).toBe(false);
      jexpect(component.errorMessage).toContain('SKU');
      done();
    }, 100);
  });

  it('should handle 400 bad request error', (done) => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'cert.pdf', archivo: mockFile }];

    component.productoForm.patchValue({
      nombreProducto: 'Test Producto',
      codigoSku: 'SKU-001',
      categoria: 'medicamento',
      precioUnitario: 100,
      condicionesAlmacenamiento: 'Temp',
      fechaVencimiento: '2026-12-31',
      bodega: MOCK_BODEGA_NOMBRE,
      lote: 'LOTE-001',
      cantidadInicial: 2,
      estado: 'activo'
    });

    const mockRequest = {
      nombre: 'Test Producto', codigo_sku: 'SKU-001', categoria: 'medicamento', precio_unitario: 100,
      condiciones_almacenamiento: 'Temp', fecha_vencimiento: '2026-12-31', ubicacion: MOCK_BODEGA_NOMBRE,
      lote: 'LOTE-001', cantidad_inicial: 2, certificaciones: [mockFile]
    };

    productoServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    productoServiceSpy.validarDatosProducto.and.returnValue({ valid: true, errors: [] });
    productoServiceSpy.registrarProducto.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'Datos inválidos' } }))
    );

    component.onSubmit();

    setTimeout(() => {
      jexpect(component.isLoading).toBe(false);
      jexpect(component.errorMessage).toContain('Datos');
      done();
    }, 100);
  });

  it('should trigger file input click', () => {
    const input = document.createElement('input');
    input.id = 'fileInput';
    spyOn(document, 'getElementById').and.returnValue(input);
    const clickSpy = spyOn(input, 'click');

    component.triggerFileInput();

    jexpect(document.getElementById).toHaveBeenCalledWith('fileInput');
    jexpect(clickSpy).toHaveBeenCalled();
  });

  it('should return minLength error message', () => {
    const nombreControl = component.productoForm.get('nombreProducto');
    nombreControl?.setValue('aa');
    (nombreControl as any).errors = { minLength: { requiredLength: 3 } };
    jexpect(component.getErrorMessage('nombreProducto')).toContain('Mínimo');
  });

  it('should have categorias list defined', () => {
    jexpect(component.categorias.length).toBe(4);
    jexpect(component.categorias).toContain({ value: 'medicamento', label: 'Medicamento' });
  });

  it('should have estados list defined', () => {
    jexpect(component.estados.length).toBe(2);
    jexpect(component.estados).toContain({ value: 'activo', label: 'Activo' });
  });

  it('should load bodegas on init', () => {
    jexpect(rutaServiceSpy.obtenerBodegas).toHaveBeenCalled();
    jexpect(component.bodegas.length).toBe(2);
    jexpect(component.bodegas[0].nombre).toBe('Bodega Central CDMX');
    jexpect(component.bodegas[0].id).toBe('d5a82834-6c23-4837-a00b-4f91cc153260');
  });

  it('should handle error when loading bodegas', () => {
    const protoSnackSpy = spyOn(MatSnackBar.prototype, 'open');
    rutaServiceSpy.obtenerBodegas.and.returnValue(throwError(() => new Error('fallo bodegas')));
    (component as any).cargarBodegas();
    jexpect(protoSnackSpy).toHaveBeenCalledWith('Error al cargar las bodegas', 'Cerrar', jasmine.any(Object));
    jexpect(component.isLoadingBodegas).toBeFalse();
  });

  it('should initialize with isLoading false', () => {
    jexpect(component.isLoading).toBe(false);
  });

  it('should initialize with empty errorMessage', () => {
    jexpect(component.errorMessage).toBe('');
  });
});
