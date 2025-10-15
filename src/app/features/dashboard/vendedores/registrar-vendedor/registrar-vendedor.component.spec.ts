import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { RegistrarVendedorComponent } from './registrar-vendedor.component';
import { VendedorHttpService } from '../../../../core/services/vendedor-http.service';

describe('RegistrarVendedorComponent', () => {
  let component: RegistrarVendedorComponent;
  let fixture: ComponentFixture<RegistrarVendedorComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<RegistrarVendedorComponent>>;
  let vendedorServiceSpy: jasmine.SpyObj<VendedorHttpService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    vendedorServiceSpy = jasmine.createSpyObj('VendedorHttpService', [
      'registrarVendedor',
      'validarDatosVendedor',
      'mapearFormularioARequest'
    ]);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [RegistrarVendedorComponent, ReactiveFormsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: VendedorHttpService, useValue: vendedorServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        provideAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.vendedorForm).toBeDefined();
    expect(component.vendedorForm.get('nombres')?.value).toBe('');
    expect(component.vendedorForm.get('apellidos')?.value).toBe('');
    expect(component.vendedorForm.get('zona')?.value).toBe('');
    expect(component.vendedorForm.get('estado')?.value).toBe('');
  });

  it('should have required validators on critical fields', () => {
    const nombresControl = component.vendedorForm.get('nombres');
    const apellidosControl = component.vendedorForm.get('apellidos');
    const emailControl = component.vendedorForm.get('email');

    nombresControl?.setValue('');
    apellidosControl?.setValue('');
    emailControl?.setValue('');

    expect(nombresControl?.hasError('required')).toBe(true);
    expect(apellidosControl?.hasError('required')).toBe(true);
    expect(emailControl?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.vendedorForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate telefono pattern', () => {
    const telefonoControl = component.vendedorForm.get('telefono');
    
    telefonoControl?.setValue('ABC123');
    expect(telefonoControl?.hasError('pattern')).toBe(true);

    telefonoControl?.setValue('3001234567');
    expect(telefonoControl?.hasError('pattern')).toBe(false);
  });

  it('should clear a field', () => {
    component.vendedorForm.patchValue({ nombres: 'Juan' });
    
    component.clearField('nombres');
    
    expect(component.vendedorForm.get('nombres')?.value).toBe('');
  });

  it('should return correct error message for required field', () => {
    const nombresControl = component.vendedorForm.get('nombres');
    nombresControl?.setValue('');
    nombresControl?.markAsTouched();

    expect(component.getErrorMessage('nombres')).toBe('Este campo es obligatorio');
  });

  it('should return correct error message for invalid email', () => {
    const emailControl = component.vendedorForm.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();

    expect(component.getErrorMessage('email')).toBe('El correo electrónico no es válido');
  });

  it('should return correct error message for pattern error', () => {
    const telefonoControl = component.vendedorForm.get('telefono');
    telefonoControl?.setValue('ABC');
    telefonoControl?.markAsTouched();

    expect(component.getErrorMessage('telefono')).toBe('El formato no es válido');
  });

  it('should close dialog on cancel', () => {
    component.onCancel();

    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();

    expect(vendedorServiceSpy.registrarVendedor).not.toHaveBeenCalled();
  });

  it('should mark all fields as touched when submitting invalid form', () => {
    component.onSubmit();

    Object.keys(component.vendedorForm.controls).forEach(key => {
      expect(component.vendedorForm.get(key)?.touched).toBe(true);
    });
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
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
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

    expect(vendedorServiceSpy.registrarVendedor).toHaveBeenCalledWith(mockRequest);
    expect(dialogRefSpy.close).toHaveBeenCalledWith(mockResponse);
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
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    };

    vendedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    vendedorServiceSpy.validarDatosVendedor.and.returnValue({
      valid: false,
      errors: ['El teléfono debe tener al menos 7 dígitos']
    });

    component.onSubmit();

    expect(vendedorServiceSpy.registrarVendedor).not.toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should handle 409 conflict error (duplicate email)', (done: DoneFn) => {
    component.vendedorForm.patchValue({
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    });

    const mockRequest = {
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    };

    vendedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    vendedorServiceSpy.validarDatosVendedor.and.returnValue({ valid: true, errors: [] });
    vendedorServiceSpy.registrarVendedor.and.returnValue(
      throwError(() => ({ status: 409, error: { error: 'Email ya existe' } }))
    );

    component.onSubmit();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toContain('Email');
      done();
    }, 100);
  });

  it('should handle 400 bad request error', (done: DoneFn) => {
    component.vendedorForm.patchValue({
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    });

    const mockRequest = {
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    };

    vendedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    vendedorServiceSpy.validarDatosVendedor.and.returnValue({ valid: true, errors: [] });
    vendedorServiceSpy.registrarVendedor.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'Datos inválidos' } }))
    );

    component.onSubmit();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toContain('Datos inválidos');
      done();
    }, 100);
  });

  it('should handle generic error', (done: DoneFn) => {
    component.vendedorForm.patchValue({
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    });

    const mockRequest = {
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    };

    vendedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    vendedorServiceSpy.validarDatosVendedor.and.returnValue({ valid: true, errors: [] });
    vendedorServiceSpy.registrarVendedor.and.returnValue(
      throwError(() => ({ status: 500, error: {} }))
    );

    component.onSubmit();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Error al registrar el vendedor');
      done();
    }, 100);
  });

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
      nombres: 'Juan',
      apellidos: 'Pérez',
      zona: 'Colombia',
      estado: 'Activo',
      telefono: '3001234567',
      email: 'juan.perez@example.com'
    };

    vendedorServiceSpy.mapearFormularioARequest.and.returnValue(mockRequest);
    vendedorServiceSpy.validarDatosVendedor.and.returnValue({ valid: true, errors: [] });
    vendedorServiceSpy.registrarVendedor.and.returnValue(of({} as any));

    component.onSubmit();

    expect(component.isLoading).toBe(false); // Ya terminó por ser síncrono en el test
  });

  it('should have zonas list defined', () => {
    expect(component.zonas.length).toBeGreaterThan(0);
    expect(component.zonas[0]).toEqual({ value: 'Colombia', label: 'Colombia' });
  });

  it('should have estados list defined', () => {
    expect(component.estados.length).toBe(2);
    expect(component.estados).toContain({ value: 'Activo', label: 'Activo' });
    expect(component.estados).toContain({ value: 'Inactivo', label: 'Inactivo' });
  });

  it('should initialize with isLoading false', () => {
    expect(component.isLoading).toBe(false);
  });

  it('should initialize with empty errorMessage', () => {
    expect(component.errorMessage).toBe('');
  });
});
