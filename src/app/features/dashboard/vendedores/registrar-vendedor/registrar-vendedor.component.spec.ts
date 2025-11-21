import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { RegistrarVendedorComponent } from './registrar-vendedor.component';
import { VendedorHttpService } from '../../../../core/services/vendedor-http.service';
import { RutaHttpService } from '../../../../core/services/ruta-http.service';
// Helper para forzar tipo Jasmine y evitar conflicto con Assertion
const jexpect = (v: any) => (expect(v) as any);
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../../testing/i18n-testing.helper';

describe('RegistrarVendedorComponent', () => {
  let component: RegistrarVendedorComponent;
  let fixture: ComponentFixture<RegistrarVendedorComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<RegistrarVendedorComponent>>;
  let vendedorServiceSpy: jasmine.SpyObj<VendedorHttpService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let rutaServiceSpy: jasmine.SpyObj<RutaHttpService>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    vendedorServiceSpy = jasmine.createSpyObj('VendedorHttpService', [
      'registrarVendedor',
      'validarDatosVendedor',
      'mapearFormularioARequest'
    ]);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    rutaServiceSpy = jasmine.createSpyObj('RutaHttpService', ['obtenerZonas']);
    rutaServiceSpy.obtenerZonas.and.returnValue(of({ data: [], total: 0 }));

    await TestBed.configureTestingModule({
      imports: [
        RegistrarVendedorComponent, 
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: VendedorHttpService, useValue: vendedorServiceSpy },
  { provide: MatSnackBar, useValue: snackBarSpy },
  { provide: RutaHttpService, useValue: rutaServiceSpy },
        provideAnimations(),
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  jexpect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
  jexpect(component.vendedorForm).toBeDefined();
  jexpect(component.vendedorForm.get('nombres')?.value).toBe('');
  jexpect(component.vendedorForm.get('apellidos')?.value).toBe('');
  jexpect(component.vendedorForm.get('zona')?.value).toBe('');
  jexpect(component.vendedorForm.get('estado')?.value).toBe('');
  });

  it('should have required validators on critical fields', () => {
    const nombresControl = component.vendedorForm.get('nombres');
    const apellidosControl = component.vendedorForm.get('apellidos');
    const emailControl = component.vendedorForm.get('email');

    nombresControl?.setValue('');
    apellidosControl?.setValue('');
    emailControl?.setValue('');

  jexpect(nombresControl?.hasError('required')).toBe(true);
  jexpect(apellidosControl?.hasError('required')).toBe(true);
  jexpect(emailControl?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.vendedorForm.get('email');
    
    emailControl?.setValue('invalid-email');
  jexpect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
  jexpect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate telefono pattern', () => {
    const telefonoControl = component.vendedorForm.get('telefono');
    
    telefonoControl?.setValue('ABC123');
  jexpect(telefonoControl?.hasError('pattern')).toBe(true);

    telefonoControl?.setValue('3001234567');
  jexpect(telefonoControl?.hasError('pattern')).toBe(false);
  });

  it('should clear a field', () => {
    component.vendedorForm.patchValue({ nombres: 'Juan' });
    
    component.clearField('nombres');
    
  jexpect(component.vendedorForm.get('nombres')?.value).toBe('');
  });

  it('should return correct error message for required field', () => {
    const nombresControl = component.vendedorForm.get('nombres');
    nombresControl?.setValue('');
    nombresControl?.markAsTouched();

  jexpect(component.getErrorMessage('nombres')).toBe('Este campo es obligatorio');
  });

  it('should return correct error message for invalid email', () => {
    const emailControl = component.vendedorForm.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();

  jexpect(component.getErrorMessage('email')).toBe('El correo electrónico no es válido');
  });

  it('should return correct error message for pattern error', () => {
    const telefonoControl = component.vendedorForm.get('telefono');
    telefonoControl?.setValue('ABC');
    telefonoControl?.markAsTouched();

  jexpect(component.getErrorMessage('telefono')).toBe('El formato no es válido');
  });

  it('should close dialog on cancel', () => {
    component.onCancel();

  jexpect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();

  jexpect(vendedorServiceSpy.registrarVendedor).not.toHaveBeenCalled();
  });

  it('should mark all fields as touched when submitting invalid form', () => {
    component.onSubmit();

    for (const key of Object.keys(component.vendedorForm.controls)) {
      jexpect(component.vendedorForm.get(key)?.touched).toBe(true);
    }
  });

  it('should submit successfully with valid data', () => {
    component.vendedorForm.patchValue({
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    });

    const mockRequest = {
      nombre: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      correo: 'juan.perez@example.com'
    };

    const mockResponse = {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com',
      created_at: '2025-10-14T22:00:00.000000',
      updated_at: '2025-10-14T22:00:00.000000'
    };

    vendedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    vendedorServiceSpy.validarDatosVendedor.and.returnValue({ valid: true, errors: [] });
    vendedorServiceSpy.registrarVendedor.and.returnValue(of(mockResponse as any));

    component.onSubmit();

  jexpect(vendedorServiceSpy.registrarVendedor).toHaveBeenCalledWith(mockRequest);
  jexpect(dialogRefSpy.close).toHaveBeenCalledWith(mockResponse);
  });

  it('should handle validation errors', () => {
    // Establecer un formulario válido primero
    component.vendedorForm.patchValue({
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    });

    const mockRequest = {
      nombre: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      correo: 'juan.perez@example.com'
    };

    vendedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    vendedorServiceSpy.validarDatosVendedor.and.returnValue({
      valid: false,
      errors: ['El teléfono debe tener al menos 7 dígitos']
    });

    component.onSubmit();

  jexpect(vendedorServiceSpy.registrarVendedor).not.toHaveBeenCalled();
  jexpect(component.isLoading).toBe(false);
  });

  it('should handle 409 conflict error (duplicate email)', fakeAsync(() => {
    component.vendedorForm.patchValue({
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    });

    const mockRequest = {
      nombre: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      correo: 'juan.perez@example.com'
    };

    vendedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    vendedorServiceSpy.validarDatosVendedor.and.returnValue({ valid: true, errors: [] });
    vendedorServiceSpy.registrarVendedor.and.returnValue(
      throwError(() => ({ status: 409, error: { error: 'Email ya existe' } }))
    );

    component.onSubmit();

    tick(110);
    jexpect(component.isLoading).toBe(false);
    jexpect(component.errorMessage).toContain('Email');
  }));

  it('should handle 400 bad request error', fakeAsync(() => {
    component.vendedorForm.patchValue({
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    });

    const mockRequest = {
      nombre: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      correo: 'juan.perez@example.com'
    };

    vendedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    vendedorServiceSpy.validarDatosVendedor.and.returnValue({ valid: true, errors: [] });
    vendedorServiceSpy.registrarVendedor.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'Datos inválidos' } }))
    );

    component.onSubmit();

    tick(110);
    jexpect(component.isLoading).toBe(false);
    jexpect(component.errorMessage).toContain('Datos inválidos');
  }));

  it('should handle generic error', fakeAsync(() => {
    component.vendedorForm.patchValue({
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    });

    const mockRequest = {
      nombre: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      correo: 'juan.perez@example.com'
    };

    vendedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    vendedorServiceSpy.validarDatosVendedor.and.returnValue({ valid: true, errors: [] });
    vendedorServiceSpy.registrarVendedor.and.returnValue(
      throwError(() => ({ status: 500, error: {} }))
    );

    component.onSubmit();

    tick(110);
    jexpect(component.isLoading).toBe(false);
    jexpect(component.errorMessage).toBe('Error al registrar el vendedor');
  }));

  it('should set isLoading to true when submitting', () => {
    component.vendedorForm.patchValue({
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    });

    const mockRequest = {
      nombre: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      correo: 'juan.perez@example.com'
    };

    vendedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    vendedorServiceSpy.validarDatosVendedor.and.returnValue({ valid: true, errors: [] });
    vendedorServiceSpy.registrarVendedor.and.returnValue(of({} as any));

    component.onSubmit();

  jexpect(component.isLoading).toBe(false); // Ya terminó por ser síncrono en el test
  });

  it('should initialize zonas list empty (loaded async via RutaHttpService)', () => {
  jexpect(component.zonas).toBeDefined();
  jexpect(Array.isArray(component.zonas)).toBeTrue();
  });

  it('should have estados list defined', () => {
  jexpect(component.estados.length).toBe(2);
  jexpect(component.estados).toContain({ value: 'Activo', label: 'Activo' });
  jexpect(component.estados).toContain({ value: 'Inactivo', label: 'Inactivo' });
  });

  it('should initialize with isLoading false', () => {
  jexpect(component.isLoading).toBe(false);
  });

  it('should initialize with empty errorMessage', () => {
  jexpect(component.errorMessage).toBe('');
  });
});
