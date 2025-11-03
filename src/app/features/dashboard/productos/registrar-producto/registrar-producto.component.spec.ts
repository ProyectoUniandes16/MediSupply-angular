import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { RegistrarProductoComponent } from './registrar-producto.component';
import { ProductoHttpService } from '../../../../core/services/producto-http.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../../testing/i18n-testing.helper';

describe('RegistrarProductoComponent', () => {
  let component: RegistrarProductoComponent;
  let fixture: ComponentFixture<RegistrarProductoComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<RegistrarProductoComponent>>;
  let productoServiceSpy: jasmine.SpyObj<ProductoHttpService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    productoServiceSpy = jasmine.createSpyObj('ProductoHttpService', [
      'registrarProducto',
      'validarDatosProducto',
      'mapearFormularioARequest'
    ]);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

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
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.productoForm).toBeDefined();
    expect(component.productoForm.get('nombreProducto')?.value).toBe('');
    expect(component.productoForm.get('codigoSku')?.value).toBe('');
  });

  it('should have required validators on critical fields', () => {
    const nombreControl = component.productoForm.get('nombreProducto');
    const skuControl = component.productoForm.get('codigoSku');
    const precioControl = component.productoForm.get('precioUnitario');

    nombreControl?.setValue('');
    skuControl?.setValue('');
    precioControl?.setValue('');

    expect(nombreControl?.hasError('required')).toBe(true);
    expect(skuControl?.hasError('required')).toBe(true);
    expect(precioControl?.hasError('required')).toBe(true);
  });

  it('should validate precio unitario minimum value', () => {
    const precioControl = component.productoForm.get('precioUnitario');
    
    precioControl?.setValue(0);
    expect(precioControl?.hasError('min')).toBe(true);

    precioControl?.setValue(10.50);
    expect(precioControl?.hasError('min')).toBe(false);
  });

  it('should clear a field', () => {
    component.productoForm.patchValue({ nombreProducto: 'Test' });
    
    component.clearField('nombreProducto');
    
    expect(component.productoForm.get('nombreProducto')?.value).toBe('');
  });

  it('should return correct error message for required field', () => {
    const nombreControl = component.productoForm.get('nombreProducto');
    nombreControl?.setValue('');
    nombreControl?.markAsTouched();

    expect(component.getErrorMessage('nombreProducto')).toBe('Este campo es obligatorio');
  });

  it('should return correct error message for min value', () => {
    const precioControl = component.productoForm.get('precioUnitario');
    precioControl?.setValue(0);
    precioControl?.markAsTouched();

    expect(component.getErrorMessage('precioUnitario')).toBe('El valor debe ser mayor a 0');
  });

  it('should add files to documentosAdjuntos', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    } as any;

    component.onFileSelected(mockEvent);

    expect(component.documentosAdjuntos.length).toBe(1);
    expect(component.documentosAdjuntos[0].nombre).toBe('cert.pdf');
  });

  it('should remove document from list', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'cert.pdf', archivo: mockFile }];

    component.eliminarDocumento(0);

    expect(component.documentosAdjuntos.length).toBe(0);
  });

  it('should open document in new window', () => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    const documento = { nombre: 'cert.pdf', archivo: mockFile };
    spyOn(window, 'open');
    spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');

    component.verDocumento(documento);

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    expect(window.open).toHaveBeenCalledWith('blob:test-url', '_blank');
  });

  it('should close dialog on cancel', () => {
    component.onCancel();

    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();

    expect(productoServiceSpy.registrarProducto).not.toHaveBeenCalled();
  });

  it('should not submit if no documents attached', () => {
    component.productoForm.patchValue({
      nombreProducto: 'Test Producto',
      codigoSku: 'SKU-001',
      categoria: 'medicamento',
      precioUnitario: 100.5,
      condicionesAlmacenamiento: 'Temp ambiente',
      fechaVencimiento: '2026-12-31',
      bodega: 'bodega_principal',
      lote: 'LOTE-001',
      cantidadInicial: 5,
      estado: 'activo'
    });

    component.onSubmit();

    expect(productoServiceSpy.registrarProducto).not.toHaveBeenCalled();
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
      bodega: 'bodega_principal',
      lote: 'LOTE-001',
      cantidadInicial: 5,
      estado: 'activo'
    });

    component.onSubmit();

    expect(snackOpenSpy).toHaveBeenCalled();
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
      bodega: 'bodega_principal',
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
      ubicacion: 'bodega_principal',
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
      ubicacion: 'bodega_principal',
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

    expect(productoServiceSpy.registrarProducto).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalled();
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
      bodega: 'bodega_principal',
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
      ubicacion: 'bodega_principal',
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

    expect(productoServiceSpy.registrarProducto).not.toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should handle 409 conflict error', (done: DoneFn) => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'cert.pdf', archivo: mockFile }];

    component.productoForm.patchValue({
      nombreProducto: 'Test Producto',
      codigoSku: 'SKU-001',
      categoria: 'medicamento',
      precioUnitario: 100,
      condicionesAlmacenamiento: 'Temp',
      fechaVencimiento: '2026-12-31',
      bodega: 'bodega_principal',
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
      ubicacion: 'bodega_principal',
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
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toContain('SKU');
      done();
    }, 100);
  });

  it('should handle 400 bad request error', (done: DoneFn) => {
    const mockFile = new File(['content'], 'cert.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'cert.pdf', archivo: mockFile }];

    component.productoForm.patchValue({
      nombreProducto: 'Test Producto',
      codigoSku: 'SKU-001',
      categoria: 'medicamento',
      precioUnitario: 100,
      condicionesAlmacenamiento: 'Temp',
      fechaVencimiento: '2026-12-31',
      bodega: 'bodega_principal',
      lote: 'LOTE-001',
      cantidadInicial: 2,
      estado: 'activo'
    });

    const mockRequest = {
      nombre: 'Test Producto', codigo_sku: 'SKU-001', categoria: 'medicamento', precio_unitario: 100,
      condiciones_almacenamiento: 'Temp', fecha_vencimiento: '2026-12-31', ubicacion: 'bodega_principal',
      lote: 'LOTE-001', cantidad_inicial: 2, certificaciones: [mockFile]
    };

    productoServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    productoServiceSpy.validarDatosProducto.and.returnValue({ valid: true, errors: [] });
    productoServiceSpy.registrarProducto.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'Datos inválidos' } }))
    );

    component.onSubmit();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toContain('Datos');
      done();
    }, 100);
  });

  it('should trigger file input click', () => {
    const input = document.createElement('input');
    input.id = 'fileInput';
    spyOn(document, 'getElementById').and.returnValue(input);
    const clickSpy = spyOn(input, 'click');

    component.triggerFileInput();

    expect(document.getElementById).toHaveBeenCalledWith('fileInput');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should return minLength error message', () => {
    const nombreControl = component.productoForm.get('nombreProducto');
    nombreControl?.setValue('aa');
    (nombreControl as any).errors = { minLength: { requiredLength: 3 } };
    expect(component.getErrorMessage('nombreProducto')).toContain('Mínimo');
  });

  it('should have categorias list defined', () => {
    expect(component.categorias.length).toBe(4);
    expect(component.categorias).toContain({ value: 'medicamento', label: 'Medicamento' });
  });

  it('should have estados list defined', () => {
    expect(component.estados.length).toBe(2);
    expect(component.estados).toContain({ value: 'activo', label: 'Activo' });
  });

  it('should have bodegas list defined', () => {
    expect(component.bodegas.length).toBe(3);
    expect(component.bodegas[0]).toEqual({ value: 'bodega_principal', label: 'Bodega Principal' });
  });

  it('should initialize with isLoading false', () => {
    expect(component.isLoading).toBe(false);
  });

  it('should initialize with empty errorMessage', () => {
    expect(component.errorMessage).toBe('');
  });
});
