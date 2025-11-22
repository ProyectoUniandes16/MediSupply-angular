import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AgregarPlanComponent } from './agregar-plan.component';
import { PlanVentaHttpService } from '../../../../core/services/plan-venta-http.service';
import { VendedorHttpService } from '../../../../core/services/vendedor-http.service';
import { FakeTranslateLoader } from '../../../../testing/i18n-testing.helper';

const jexpect = (v: any) => (expect(v) as any);

describe('AgregarPlanComponent', () => {
  let component: AgregarPlanComponent;
  let fixture: ComponentFixture<AgregarPlanComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AgregarPlanComponent>>;
  let mockPlanVentaService: jasmine.SpyObj<PlanVentaHttpService>;
  let mockVendedorService: jasmine.SpyObj<VendedorHttpService>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockPlanVentaService = jasmine.createSpyObj('PlanVentaHttpService', [
      'registrarPlanVenta',
      'validarDatosPlanVenta',
      'mapearFormularioARequest'
    ]);
    mockVendedorService = jasmine.createSpyObj('VendedorHttpService', ['obtenerVendedores']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    // Mock de vendedores
    mockVendedorService.obtenerVendedores.and.returnValue(of({
      items: [
        {
          id: '1',
          nombre: 'Juan',
          apellidos: 'Pérez',
          correo: 'juan@test.com',
          telefono: '123456',
          zona: 'Norte',
          estado: 'Activo',
          fechaCreacion: '2025-01-01',
          fechaActualizacion: '2025-01-01',
          usuarioCreacion: 'admin',
          usuarioActualizacion: null
        },
        {
          id: '2',
          nombre: 'María',
          apellidos: 'González',
          correo: 'maria@test.com',
          telefono: '654321',
          zona: 'Sur',
          estado: 'Activo',
          fechaCreacion: '2025-01-01',
          fechaActualizacion: '2025-01-01',
          usuarioCreacion: 'admin',
          usuarioActualizacion: null
        }
      ],
      page: 1,
      size: 100,
      total: 2
    }));

    await TestBed.configureTestingModule({
      imports: [
        AgregarPlanComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: PlanVentaHttpService, useValue: mockPlanVentaService },
        { provide: VendedorHttpService, useValue: mockVendedorService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    jexpect(component).toBeTruthy();
  });

  it('should initialize form with validators', () => {
    jexpect(component.planForm).toBeDefined();
    jexpect(component.planForm.get('nombrePlan')).toBeDefined();
    jexpect(component.planForm.get('vendedoresIds')).toBeDefined();
    jexpect(component.planForm.get('periodo')).toBeDefined();
    jexpect(component.planForm.get('metaIngresos')).toBeDefined();
    jexpect(component.planForm.get('metaVisitas')).toBeDefined();
    jexpect(component.planForm.get('metaClientesNuevos')).toBeDefined();
    jexpect(component.planForm.get('estado')).toBeDefined();
  });

  it('should load vendedores on init', () => {
    jexpect(mockVendedorService.obtenerVendedores).toHaveBeenCalledWith({
      page: 1,
      size: 100,
      estado: 'Activo'
    });
    jexpect(component.vendedores.length).toBe(2);
    jexpect(component.vendedores[0].nombre).toBe('Juan');
  });

  it('should handle error when loading vendedores', () => {
    mockVendedorService.obtenerVendedores.and.returnValue(
      throwError(() => new Error('Error al cargar'))
    );

    component.cargarVendedores();

    // Verificamos que el flag de carga se desactive y no lance excepciones
    jexpect(component.isLoading).toBeFalse();
  });

  it('should clear field value', () => {
    component.planForm.patchValue({ nombrePlan: 'Test Plan' });
    jexpect(component.planForm.get('nombrePlan')?.value).toBe('Test Plan');
    
    component.clearField('nombrePlan');
    
    jexpect(component.planForm.get('nombrePlan')?.value).toBe('');
  });

  it('should return correct error messages', () => {
    const nombreControl = component.planForm.get('nombrePlan');
    nombreControl?.markAsTouched();
    nombreControl?.setValue('');
    
  jexpect(component.getErrorMessage('nombrePlan')).toBe('Este campo es obligatorio');
    
    nombreControl?.setValue('ab');
    nombreControl?.setErrors({ minLength: { requiredLength: 3, actualLength: 2 } });
  jexpect(component.getErrorMessage('nombrePlan')).toContain('Mínimo');
    
    const periodoControl = component.planForm.get('periodo');
    periodoControl?.markAsTouched();
    periodoControl?.setValue('invalid');
    periodoControl?.setErrors({ pattern: true });
    
    jexpect(component.getErrorMessage('periodo')).toContain('YYYY-MM');
  });

  it('should get vendedor full name', () => {
    const vendedor = component.vendedores[0];
    const fullName = component.getVendedorNombre(vendedor);
    
    jexpect(fullName).toBe('Juan Pérez');
  });

  it('should submit valid form successfully', () => {
    const snackSpy = spyOn((component as any).snackBar, 'open');
    const mockRequest = {
      nombre_plan: 'Plan Q1 2025',
      gerente_id: 'default-gerente-id',
      vendedores_ids: ['1', '2'],
      periodo: '2025-01',
      meta_ingresos: 50000,
      meta_visitas: 100,
      meta_clientes_nuevos: 20,
      estado: 'activo'
    };

    const mockResponse = {
      id: '123',
      ...mockRequest
    };

    mockPlanVentaService.mapearFormularioARequest.and.returnValue(mockRequest);
    mockPlanVentaService.validarDatosPlanVenta.and.returnValue({ valid: true, errors: [] });
    mockPlanVentaService.registrarPlanVenta.and.returnValue(of(mockResponse));

    component.planForm.patchValue({
      nombrePlan: 'Plan Q1 2025',
      vendedoresIds: ['1', '2'],
      periodo: '2025-01',
      metaIngresos: 50000,
      metaVisitas: 100,
      metaClientesNuevos: 20,
      estado: 'activo'
    });

    component.onSubmit();

    jexpect(mockPlanVentaService.mapearFormularioARequest).toHaveBeenCalled();
    jexpect(mockPlanVentaService.validarDatosPlanVenta).toHaveBeenCalledWith(mockRequest);
    jexpect(mockPlanVentaService.registrarPlanVenta).toHaveBeenCalledWith(mockRequest);
    jexpect(mockDialogRef.close).toHaveBeenCalledWith(mockResponse);
    jexpect(snackSpy).toHaveBeenCalled();
  });

  it('should not submit invalid form', () => {
    component.planForm.patchValue({
      nombrePlan: '',
      vendedoresIds: [],
      periodo: '',
      metaIngresos: '',
      metaVisitas: '',
      metaClientesNuevos: '',
      estado: ''
    });

    component.onSubmit();

    jexpect(mockPlanVentaService.registrarPlanVenta).not.toHaveBeenCalled();
    jexpect(component.planForm.get('nombrePlan')?.touched).toBe(true);
  });

  it('should handle validation errors before submitting', () => {
    const snackSpy = spyOn((component as any).snackBar, 'open');
    const mockRequest = {
      nombre_plan: '',
      gerente_id: 'default-gerente-id',
      vendedores_ids: [],
      periodo: '',
      meta_ingresos: 0,
      meta_visitas: 0,
      meta_clientes_nuevos: 0,
      estado: ''
    };

    mockPlanVentaService.mapearFormularioARequest.and.returnValue(mockRequest);
    mockPlanVentaService.validarDatosPlanVenta.and.returnValue({
      valid: false,
      errors: ['Error de validación']
    });

    component.planForm.patchValue({
      nombrePlan: '',
      vendedoresIds: [],
      periodo: '',
      metaIngresos: 0,
      metaVisitas: 0,
      metaClientesNuevos: 0,
      estado: ''
    });

    // Force form to be valid to reach validation logic
    for (const key of Object.keys(component.planForm.controls)) {
      component.planForm.get(key)?.clearValidators();
      component.planForm.get(key)?.updateValueAndValidity();
    }

    component.onSubmit();

    jexpect(mockPlanVentaService.validarDatosPlanVenta).toHaveBeenCalled();
    jexpect(snackSpy).toHaveBeenCalledWith(
      'Error de validación',
      'Cerrar',
      jasmine.objectContaining({ duration: 5000 })
    );
  });

  it('should handle 400 error on submit', () => {
    const snackSpy = spyOn((component as any).snackBar, 'open');
    const mockRequest = {
      nombre_plan: 'Plan Q1 2025',
      gerente_id: 'default-gerente-id',
      vendedores_ids: ['1'],
      periodo: '2025-01',
      meta_ingresos: 50000,
      meta_visitas: 100,
      meta_clientes_nuevos: 20,
      estado: 'activo'
    };

    mockPlanVentaService.mapearFormularioARequest.and.returnValue(mockRequest);
    mockPlanVentaService.validarDatosPlanVenta.and.returnValue({ valid: true, errors: [] });
    mockPlanVentaService.registrarPlanVenta.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'Datos inválidos' } }))
    );

    component.planForm.patchValue({
      nombrePlan: 'Plan Q1 2025',
      vendedoresIds: ['1'],
      periodo: '2025-01',
      metaIngresos: 50000,
      metaVisitas: 100,
      metaClientesNuevos: 20,
      estado: 'activo'
    });

    component.onSubmit();

    jexpect(snackSpy).toHaveBeenCalledWith(
      'Datos inválidos',
      'Cerrar',
      jasmine.objectContaining({ duration: 6000 })
    );
  });

  it('should handle 409 conflict error on submit', () => {
    const snackSpy = spyOn((component as any).snackBar, 'open');
    const mockRequest = {
      nombre_plan: 'Plan Q1 2025',
      gerente_id: 'default-gerente-id',
      vendedores_ids: ['1'],
      periodo: '2025-01',
      meta_ingresos: 50000,
      meta_visitas: 100,
      meta_clientes_nuevos: 20,
      estado: 'activo'
    };

    mockPlanVentaService.mapearFormularioARequest.and.returnValue(mockRequest);
    mockPlanVentaService.validarDatosPlanVenta.and.returnValue({ valid: true, errors: [] });
    mockPlanVentaService.registrarPlanVenta.and.returnValue(
      throwError(() => ({ status: 409, error: { error: 'Plan ya existe' } }))
    );

    component.planForm.patchValue({
      nombrePlan: 'Plan Q1 2025',
      vendedoresIds: ['1'],
      periodo: '2025-01',
      metaIngresos: 50000,
      metaVisitas: 100,
      metaClientesNuevos: 20,
      estado: 'activo'
    });

    component.onSubmit();

    jexpect(snackSpy).toHaveBeenCalledWith(
      'Plan ya existe',
      'Cerrar',
      jasmine.objectContaining({ duration: 6000 })
    );
  });

  it('should close dialog on cancel', () => {
    component.onCancel();

    jexpect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should have correct estados options', () => {
    jexpect(component.estados).toEqual([
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' },
      { value: 'pendiente', label: 'Pendiente' }
    ]);
  });

  it('should disable submit button when loading', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const submitButton = fixture.nativeElement.querySelector('button[color="primary"]');
    jexpect(submitButton?.disabled).toBe(true);
  });

  it('should show error message when present', () => {
    component.errorMessage = 'Test error message';
    fixture.detectChanges();
    
    const errorElement = fixture.nativeElement.querySelector('.error-message');
    jexpect(errorElement).toBeTruthy();
    jexpect(errorElement?.textContent).toContain('Test error message');
  });

  it('should show loading spinner when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const loadingOverlay = fixture.nativeElement.querySelector('.loading-overlay');
    jexpect(loadingOverlay).toBeTruthy();
  });

  it('should remove a selected vendedor from form when eliminarVendedor is called', () => {
    // set selected ids
    component.planForm.patchValue({ vendedoresIds: ['1', '2'] });
    // call eliminar on vendor object with id '1'
    const vendedor = component.vendedores.find(v => v.id === '1')!;
    component.eliminarVendedor(vendedor);
    const ids: string[] = component.planForm.get('vendedoresIds')?.value || [];
    jexpect(ids).toEqual(['2']);
  });
});
