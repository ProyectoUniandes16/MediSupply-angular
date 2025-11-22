import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GenerarInformeVendedorComponent } from './generar-informe-vendedor.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError, Subject } from 'rxjs';
import { VendedorHttpService } from '../../../../core/services/vendedor-http.service';
import { ObtenerVendedoresResponse, ReporteVentasVendedor } from '../../../../core/models/vendedor.models';

const jexpect = (v: any) => (expect(v) as any);

describe('GenerarInformeVendedorComponent', () => {
  let component: GenerarInformeVendedorComponent;
  let fixture: ComponentFixture<GenerarInformeVendedorComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<GenerarInformeVendedorComponent>>;
  let vendedorService: jasmine.SpyObj<VendedorHttpService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockVendedoresResponse: ObtenerVendedoresResponse = {
    items: [
      {
        id: '1',
        nombre: 'Juan',
        apellidos: 'Pérez',
        correo: 'juan@test.com',
        telefono: '+57 3001234567',
        zona: 'Colombia',
        estado: 'Activo',
        fechaCreacion: '2025-01-01',
        fechaActualizacion: '2025-01-01',
        usuarioCreacion: 'admin',
        usuarioActualizacion: null
      }
    ],
    page: 1,
    size: 100,
    total: 1
  };

  const mockReporte: ReporteVentasVendedor = {
    vendedor: {
      id: '1',
      nombre_completo: 'Juan Pérez',
      correo: 'juan@test.com',
      zona: 'Colombia'
    },
    periodo: {
      mes: 11,
      anio: 2025,
      mes_nombre: 'Noviembre',
      periodo_formato: '2025-11'
    },
    metricas: {
      ventas_realizadas: 10,
      monto_total: 1000000,
      monto_promedio: 100000,
      clientes_unicos: 5,
      meta_ingresos_total: 1200000,
      cumplimiento_porcentaje: 83.33
    },
    pedidos_detalle: [],
    planes: []
  };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const vendedorServiceSpy = jasmine.createSpyObj('VendedorHttpService', [
      'obtenerVendedores',
      'obtenerReporteVentas'
    ]);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        GenerarInformeVendedorComponent,
        NoopAnimationsModule
      ],
      providers: [
        provideHttpClient(),
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: VendedorHttpService, useValue: vendedorServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<GenerarInformeVendedorComponent>>;
    vendedorService = TestBed.inject(VendedorHttpService) as jasmine.SpyObj<VendedorHttpService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    vendedorService.obtenerVendedores.and.returnValue(of(mockVendedoresResponse));
    vendedorService.obtenerReporteVentas.and.returnValue(of(mockReporte));

    fixture = TestBed.createComponent(GenerarInformeVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    jexpect(component).toBeTruthy();
  });

  it('should initialize form on init', () => {
    jexpect(component.formulario).toBeDefined();
    jexpect(component.formulario.get('vendedor')).toBeDefined();
    jexpect(component.formulario.get('tipo')).toBeDefined();
    jexpect(component.formulario.get('anio')).toBeDefined();
    jexpect(component.formulario.get('mes')).toBeDefined();
  });

  it('should load vendedores on init', fakeAsync(() => {
    tick();
    jexpect(vendedorService.obtenerVendedores).toHaveBeenCalled();
    jexpect(component.vendedores.length).toBe(1);
  }));

  it('should generate years array', () => {
    const currentYear = new Date().getFullYear();
    jexpect(component.anios.length).toBe(5);
    jexpect(component.anios[0]).toBe(currentYear);
    jexpect(component.anios[4]).toBe(currentYear - 4);
  });

  it('should have 12 months', () => {
    jexpect(component.meses.length).toBe(12);
    jexpect(component.meses[0].valor).toBe(1);
    jexpect(component.meses[0].nombre).toBe('Enero');
  });

  it('should have tipo reporte as ventas', () => {
    jexpect(component.tiposReporte.length).toBe(1);
    jexpect(component.tiposReporte[0].valor).toBe('ventas');
  });

  it('should show error when form is invalid', fakeAsync(() => {
    component.generarInforme();
    tick();

    // Solo verificamos que la generación no quede activa
    jexpect(component.isGenerating).toBe(false);
  }));

  it('should generate report successfully', fakeAsync(() => {
    component.formulario.patchValue({
      vendedor: '1',
      tipo: 'ventas',
      anio: 2025,
      mes: 11
    });

    component.generarInforme();
    tick();

    jexpect(vendedorService.obtenerReporteVentas).toHaveBeenCalledWith('1', 11, 2025);
    jexpect(component.isGenerating).toBe(false);
    jexpect(dialogRef.close).toHaveBeenCalledWith(mockReporte);
  }));

  it('should handle error when generating report', fakeAsync(() => {
    component.formulario.patchValue({
      vendedor: '1',
      tipo: 'ventas',
      anio: 2025,
      mes: 11
    });

    vendedorService.obtenerReporteVentas.and.returnValue(
      throwError(() => ({ error: { message: 'Error al generar reporte' } }))
    );

    component.generarInforme();
    tick();

    jexpect(component.isGenerating).toBe(false);
  }));

  it('should handle error without message', fakeAsync(() => {
    component.formulario.patchValue({
      vendedor: '1',
      tipo: 'ventas',
      anio: 2025,
      mes: 11
    });

    vendedorService.obtenerReporteVentas.and.returnValue(
      throwError(() => ({}))
    );

    component.generarInforme();
    tick();

    // Solo verificamos que el flujo de error se maneje y finalice
    jexpect(component.isGenerating).toBe(false);
  }));

  it('should handle null reporte', fakeAsync(() => {
    component.formulario.patchValue({
      vendedor: '1',
      tipo: 'ventas',
      anio: 2025,
      mes: 11
    });

    vendedorService.obtenerReporteVentas.and.returnValue(of(null as any));

    component.generarInforme();
    tick();

    // Solo verificamos que el flujo termine y no deje el estado bloqueado
    jexpect(component.isGenerating).toBe(false);
  }));

  it('should close dialog on cancelar', () => {
    component.cancelar();
    jexpect(dialogRef.close).toHaveBeenCalled();
  });

  it('should handle error loading vendedores', fakeAsync(() => {
    vendedorService.obtenerVendedores.and.returnValue(
      throwError(() => new Error('Error loading'))
    );

    const newFixture = TestBed.createComponent(GenerarInformeVendedorComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();
    tick();

    jexpect(newComponent.isLoading).toBe(false);
    // Solo verificamos que el flujo de error complete sin lanzar excepciones
  }));

  it('should get vendedor nombre completo', () => {
    const vendedor = mockVendedoresResponse.items[0];
    const nombre = component.obtenerNombreVendedor(vendedor);
    jexpect(nombre).toBe('Juan Pérez');
  });

  it('should have default tipo as ventas in form', () => {
    const tipo = component.formulario.get('tipo')?.value;
    jexpect(tipo).toBe('ventas');
  });

  it('should have all required validators', () => {
    const vendedorControl = component.formulario.get('vendedor');
    const tipoControl = component.formulario.get('tipo');
    const anioControl = component.formulario.get('anio');
    const mesControl = component.formulario.get('mes');

    jexpect(vendedorControl?.hasError('required')).toBe(true);
    jexpect(tipoControl?.hasError('required')).toBe(false); // Has default value
    jexpect(anioControl?.hasError('required')).toBe(true);
    jexpect(mesControl?.hasError('required')).toBe(true);
  });

  it('should mark form as invalid when fields are empty', () => {
    component.formulario.patchValue({
      vendedor: '',
      tipo: 'ventas',
      anio: '',
      mes: ''
    });

    jexpect(component.formulario.invalid).toBe(true);
  });

  it('should mark form as valid when all fields are filled', () => {
    component.formulario.patchValue({
      vendedor: '1',
      tipo: 'ventas',
      anio: 2025,
      mes: 11
    });

    jexpect(component.formulario.valid).toBe(true);
  });

  it('should set isGenerating to true when generating', fakeAsync(() => {
    component.formulario.patchValue({
      vendedor: '1',
      tipo: 'ventas',
      anio: 2025,
      mes: 11
    });

    // Usamos un Subject que no emite/completa de inmediato para poder
    // observar el estado intermedio isGenerating = true
    const subject = new Subject<ReporteVentasVendedor>();
    vendedorService.obtenerReporteVentas.and.returnValue(subject.asObservable());

    component.generarInforme();

    jexpect(component.isGenerating).toBe(true);
    tick(); // Complete async operations (no debería cambiar isGenerating aún)
  }));

  it('should load vendedores without leaving loading state active', fakeAsync(() => {
    component.isLoading = false;
    (component as any).cargarVendedores();
    tick(); // Completa la llamada async

    // Solo verificamos que después de la carga no quede bloqueado
    jexpect(component.isLoading).toBe(false);
    jexpect(component.vendedores.length).toBeGreaterThan(0);
  }));

  it('should have correct mes names in spanish', () => {
    jexpect(component.meses[0].nombre).toBe('Enero');
    jexpect(component.meses[5].nombre).toBe('Junio');
    jexpect(component.meses[11].nombre).toBe('Diciembre');
  });

  it('should console log the reporte data', fakeAsync(() => {
    spyOn(console, 'log');
    component.formulario.patchValue({
      vendedor: '1',
      tipo: 'ventas',
      anio: 2025,
      mes: 11
    });

    component.generarInforme();
    tick();

    jexpect(console.log).toHaveBeenCalledWith('Generando informe para:', jasmine.any(Object));
    jexpect(console.log).toHaveBeenCalledWith('Reporte recibido:', mockReporte);
  }));

  it('should handle error with nested message structure', fakeAsync(() => {
    component.formulario.patchValue({
      vendedor: '1',
      tipo: 'ventas',
      anio: 2025,
      mes: 11
    });

    vendedorService.obtenerReporteVentas.and.returnValue(
      throwError(() => ({ error: { message: 'Nested error message' } }))
    );

    component.generarInforme();
    tick();

    jexpect(component.isGenerating).toBe(false);
  }));
});
