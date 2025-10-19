import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { RegistrarProveedorComponent } from './registrar-proveedor.component';
import { ProveedorHttpService } from '../../../../core/services/proveedor-http.service';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../../testing/i18n-testing.helper';

describe('RegistrarProveedorComponent', () => {
  let component: RegistrarProveedorComponent;
  let fixture: ComponentFixture<RegistrarProveedorComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<RegistrarProveedorComponent>>;
  let proveedorServiceSpy: jasmine.SpyObj<ProveedorHttpService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    proveedorServiceSpy = jasmine.createSpyObj('ProveedorHttpService', [
      'registrarProveedor',
      'validarDatosProveedor',
      'mapearFormularioARequest'
    ]);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RegistrarProveedorComponent, 
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: ProveedorHttpService, useValue: proveedorServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        provideAnimations(),
        TranslateService
      ]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('es');

    fixture = TestBed.createComponent(RegistrarProveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.proveedorForm).toBeDefined();
    expect(component.proveedorForm.get('nombreProveedor')?.value).toBe('');
    expect(component.proveedorForm.get('nit')?.value).toBe('');
  });

  it('should have required validators on critical fields', () => {
    const nombreControl = component.proveedorForm.get('nombreProveedor');
    const nitControl = component.proveedorForm.get('nit');
    const emailControl = component.proveedorForm.get('email');

    nombreControl?.setValue('');
    nitControl?.setValue('');
    emailControl?.setValue('');

    expect(nombreControl?.hasError('required')).toBe(true);
    expect(nitControl?.hasError('required')).toBe(true);
    expect(emailControl?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.proveedorForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate NIT pattern', () => {
    const nitControl = component.proveedorForm.get('nit');
    
    nitControl?.setValue('ABC123');
    expect(nitControl?.hasError('pattern')).toBe(true);

    nitControl?.setValue('900123456');
    expect(nitControl?.hasError('pattern')).toBe(false);
  });

  it('should clear a field', () => {
    component.proveedorForm.patchValue({ nombreProveedor: 'Test' });
    
    component.clearField('nombreProveedor');
    
    expect(component.proveedorForm.get('nombreProveedor')?.value).toBe('');
  });

  it('should return correct error message for required field', () => {
    const nombreControl = component.proveedorForm.get('nombreProveedor');
    nombreControl?.setValue('');
    nombreControl?.markAsTouched();

    expect(component.getErrorMessage('nombreProveedor')).toBe('Este campo es obligatorio');
  });

  it('should return correct error message for invalid email', () => {
    const emailControl = component.proveedorForm.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();

    expect(component.getErrorMessage('email')).toBe('El correo electrónico no es válido');
  });

  it('should add files to documentosAdjuntos', () => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    } as any;

    component.onFileSelected(mockEvent);

    expect(component.documentosAdjuntos.length).toBe(1);
    expect(component.documentosAdjuntos[0].nombre).toBe('test.pdf');
  });

  it('should remove document from list', () => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'test.pdf', archivo: mockFile }];

    component.eliminarDocumento(0);

    expect(component.documentosAdjuntos.length).toBe(0);
  });

  it('should open document in new window', () => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const documento = { nombre: 'test.pdf', archivo: mockFile };
    spyOn(globalThis, 'open');
    spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');

    component.verDocumento(documento);

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    expect(globalThis.open).toHaveBeenCalledWith('blob:test-url', '_blank');
  });

  it('should close dialog on cancel', () => {
    component.onCancel();

    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();

    expect(proveedorServiceSpy.registrarProveedor).not.toHaveBeenCalled();
  });

  it('should not submit if no documents attached', () => {
    component.proveedorForm.patchValue({
      nombreProveedor: 'Test Proveedor',
      nit: '900123456',
      pais: 'co',
      estado: 'activo',
      direccion: 'Calle 123',
      nombreContacto: 'Juan Pérez',
      email: 'test@test.com',
      telefono: '3001234567'
    });

    component.onSubmit();

    expect(proveedorServiceSpy.registrarProveedor).not.toHaveBeenCalled();
  });

  it('should submit successfully with valid data', () => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'test.pdf', archivo: mockFile }];

    component.proveedorForm.patchValue({
      nombreProveedor: 'Test Proveedor',
      nit: '900123456',
      pais: 'co',
      estado: 'activo',
      direccion: 'Calle 123',
      nombreContacto: 'Juan Pérez',
      email: 'test@test.com',
      telefono: '3001234567'
    });

    const mockRequest = {
      nombre: 'Test Proveedor',
      nit: '900123456',
      pais: 'co',
      direccion: 'Calle 123',
      nombre_contacto: 'Juan Pérez',
      email: 'test@test.com',
      telefono: '3001234567',
      certificaciones: [mockFile]
    };

    const mockResponse = {
      id: 1,
      nombre: 'Test Proveedor',
      nit: '900123456',
      pais: 'co',
      direccion: 'Calle 123',
      nombre_contacto: 'Juan Pérez',
      email: 'test@test.com',
      telefono: '3001234567',
      certificaciones_urls: ['http://example.com/cert.pdf'],
      created_at: '2025-10-10T01:27:40.334026',
      updated_at: '2025-10-10T01:27:40.334026'
    };

    proveedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    proveedorServiceSpy.validarDatosProveedor.and.returnValue({ valid: true, errors: [] });
    proveedorServiceSpy.registrarProveedor.and.returnValue(of(mockResponse as any));

    component.onSubmit();

    expect(proveedorServiceSpy.registrarProveedor).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should handle validation errors', () => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'test.pdf', archivo: mockFile }];

    component.proveedorForm.patchValue({
      nombreProveedor: 'Test',
      nit: '123',
      pais: 'co',
      estado: 'activo',
      direccion: 'Calle 123',
      nombreContacto: 'Juan',
      email: 'test@test.com',
      telefono: '300'
    });

    const mockRequest = {
      nombre: 'Test',
      nit: '123',
      pais: 'co',
      direccion: 'Calle 123',
      nombre_contacto: 'Juan',
      email: 'test@test.com',
      telefono: '300',
      certificaciones: [mockFile]
    };

    proveedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    proveedorServiceSpy.validarDatosProveedor.and.returnValue({
      valid: false,
      errors: ['El NIT debe tener entre 9 y 10 dígitos']
    });

    component.onSubmit();

    expect(proveedorServiceSpy.registrarProveedor).not.toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should handle 409 conflict error (duplicate NIT)', (done: DoneFn) => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'test.pdf', archivo: mockFile }];

    component.proveedorForm.patchValue({
      nombreProveedor: 'Test Proveedor',
      nit: '900123456',
      pais: 'co',
      estado: 'activo',
      direccion: 'Calle 123',
      nombreContacto: 'Juan Pérez',
      email: 'test@test.com',
      telefono: '3001234567'
    });

    const mockRequest = {
      nombre: 'Test Proveedor',
      nit: '900123456',
      pais: 'co',
      direccion: 'Calle 123',
      nombre_contacto: 'Juan Pérez',
      email: 'test@test.com',
      telefono: '3001234567',
      certificaciones: [mockFile]
    };

    proveedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    proveedorServiceSpy.validarDatosProveedor.and.returnValue({ valid: true, errors: [] });
    proveedorServiceSpy.registrarProveedor.and.returnValue(
      throwError(() => ({ status: 409, error: { error: 'NIT ya existe' } }))
    );

    component.onSubmit();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toContain('NIT');
      done();
    }, 100);
  });

  it('should handle 400 bad request error', (done: DoneFn) => {
    const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    component.documentosAdjuntos = [{ nombre: 'test.pdf', archivo: mockFile }];

    component.proveedorForm.patchValue({
      nombreProveedor: 'Test Proveedor',
      nit: '900123456',
      pais: 'co',
      estado: 'activo',
      direccion: 'Calle 123',
      nombreContacto: 'Juan Pérez',
      email: 'test@test.com',
      telefono: '3001234567'
    });

    const mockRequest = {
      nombre: 'Test Proveedor',
      nit: '900123456',
      pais: 'co',
      direccion: 'Calle 123',
      nombre_contacto: 'Juan Pérez',
      email: 'test@test.com',
      telefono: '3001234567',
      certificaciones: [mockFile]
    };

    proveedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    proveedorServiceSpy.validarDatosProveedor.and.returnValue({ valid: true, errors: [] });
    proveedorServiceSpy.registrarProveedor.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'Datos inválidos' } }))
    );

    component.onSubmit();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toContain('Datos inválidos');
      done();
    }, 100);
  });

  it('should have paises list defined', () => {
    expect(component.paises.length).toBeGreaterThan(0);
    expect(component.paises[0]).toEqual({ value: 'co', label: 'Colombia' });
  });

  it('should have estados list defined', () => {
    expect(component.estados.length).toBe(3);
    expect(component.estados).toContain({ value: 'activo', label: 'Activo' });
  });
});
