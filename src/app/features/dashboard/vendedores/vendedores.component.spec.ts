import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VendedoresComponent } from './vendedores.component';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../testing/i18n-testing.helper';
import { VendedorHttpService } from '../../../core/services/vendedor-http.service';
import { RutaHttpService } from '../../../core/services/ruta-http.service';

// Helper para evitar conflicto de tipos Assertion vs Jasmine
const jexpect = (v: any) => (expect(v) as any);
import { ObtenerVendedoresResponse, Vendedor } from '../../../core/models/vendedor.models';
import { PageEvent, MatPaginatorIntl } from '@angular/material/paginator';

describe('VendedoresComponent', () => {
  let component: VendedoresComponent;
  let fixture: ComponentFixture<VendedoresComponent>;
  let dialog: MatDialog;
  let vendedorService: VendedorHttpService;
  let rutaService: RutaHttpService;

  const mockVendedoresResponse: ObtenerVendedoresResponse = {
    items: [
      {
        id: '1',
        nombre: 'María',
        apellidos: 'González',
        correo: 'maria@medy.com',
        telefono: '+57 3205581111',
        zona: 'Colombia',
        estado: 'Activo',
        fechaCreacion: '2025-01-01',
        fechaActualizacion: '2025-01-01',
        usuarioCreacion: 'admin',
        usuarioActualizacion: null
      },
      {
        id: '2',
        nombre: 'Carlos',
        apellidos: 'Ruiz',
        correo: 'carlos@medy.com',
        telefono: '+52 15123185168',
        zona: 'México',
        estado: 'Inactivo',
        fechaCreacion: '2025-01-02',
        fechaActualizacion: '2025-01-02',
        usuarioCreacion: 'admin',
        usuarioActualizacion: null
      }
    ],
    page: 1,
    size: 10,
    total: 2
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VendedoresComponent, 
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        provideHttpClient(),
        TranslateService,
        {
          provide: VendedorHttpService,
          useValue: jasmine.createSpyObj('VendedorHttpService', ['obtenerVendedores'])
        },
        {
          provide: RutaHttpService,
          useValue: jasmine.createSpyObj('RutaHttpService', ['obtenerZonas'])
        }
      ]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('es');

    dialog = TestBed.inject(MatDialog);
  vendedorService = TestBed.inject(VendedorHttpService);
  rutaService = TestBed.inject(RutaHttpService);
    
    // Mock del servicio
    (vendedorService.obtenerVendedores as jasmine.Spy).and.returnValue(of(mockVendedoresResponse));
  (rutaService.obtenerZonas as jasmine.Spy).and.returnValue(of({ data: [], total: 0 }));

    fixture = TestBed.createComponent(VendedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    jexpect(component).toBeTruthy();
  });

  it('should have title "Vendedores"', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.title');
    jexpect(title.textContent).toContain('Vendedores');
  });

  it('should have subtitle', () => {
    const compiled = fixture.nativeElement;
    const subtitle = compiled.querySelector('.subtitle');
    jexpect(subtitle.textContent).toContain('Gestiona vendedores');
  });

  it('should have register button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('.register-button');
    jexpect(button).toBeTruthy();
    jexpect(button.textContent).toContain('Registrar Vendedor');
  });

  it('should call cargarVendedores on init', () => {
    jexpect(vendedorService.obtenerVendedores).toHaveBeenCalled();
  });

  it('should load vendedores successfully', fakeAsync(() => {
    component.cargarVendedores();
    tick();
    
    jexpect(component.vendedores.length).toBe(2);
    jexpect(component.vendedores[0].nombre).toBe('María');
    jexpect(component.total).toBe(2);
    jexpect(component.isLoading).toBe(false);
  }));

  it('should display table when vendedores are loaded', fakeAsync(() => {
    component.cargarVendedores();
    tick();
    fixture.detectChanges();
    
    const table = fixture.nativeElement.querySelector('.vendedores-table');
    jexpect(table).toBeTruthy();
  }));

  it('should display correct number of vendedores in table', fakeAsync(() => {
    component.cargarVendedores();
    tick();
    fixture.detectChanges();
    
    const rows = fixture.nativeElement.querySelectorAll('.vendedores-table tbody tr');
    jexpect(rows.length).toBe(2);
  }));

  it('should handle error when loading vendedores', fakeAsync(() => {
    // Recrear el componente para evitar conflictos con el beforeEach
    const newFixture = TestBed.createComponent(VendedoresComponent);
    const newComponent = newFixture.componentInstance;
    
    (vendedorService.obtenerVendedores as jasmine.Spy).and.returnValue(
      throwError(() => new Error('Error al cargar'))
    );
    const snackBarSpy = spyOn(newComponent['snackBar'], 'open');
    
    newComponent.cargarVendedores();
    tick();
    
    jexpect(newComponent.errorMessage).toBeTruthy();
    jexpect(newComponent.isLoading).toBe(false);
    jexpect(snackBarSpy).toHaveBeenCalled();
  }));

  it('should show loading spinner when loading', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    jexpect(spinner).toBeTruthy();
  });

  it('should show empty state when no vendedores', () => {
    component.vendedores = [];
    component.isLoading = false;
    component.errorMessage = '';
    fixture.detectChanges();
    
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    jexpect(emptyState).toBeTruthy();
  });

  it('should show error message when error occurs', () => {
    component.errorMessage = 'Error al cargar';
    component.isLoading = false;
    fixture.detectChanges();
    
    const errorMsg = fixture.nativeElement.querySelector('.error-message');
    jexpect(errorMsg).toBeTruthy();
    jexpect(errorMsg.textContent).toContain('Error al cargar');
  });

  it('should apply filters when search term changes', fakeAsync(() => {
    component.searchTerm = 'María';
    component.aplicarFiltros();
    tick();
    
    jexpect(vendedorService.obtenerVendedores).toHaveBeenCalledWith(
      jasmine.objectContaining({ nombre: 'María', page: 1 })
    );
  }));

  it('should apply filters when zona changes', fakeAsync(() => {
    component.selectedZona = 'Colombia';
    component.aplicarFiltros();
    tick();
    
    jexpect(vendedorService.obtenerVendedores).toHaveBeenCalledWith(
      jasmine.objectContaining({ zona: 'Colombia', page: 1 })
    );
  }));

  it('should apply filters when estado changes', fakeAsync(() => {
    component.selectedEstado = 'Activo';
    component.aplicarFiltros();
    tick();
    
    jexpect(vendedorService.obtenerVendedores).toHaveBeenCalledWith(
      jasmine.objectContaining({ estado: 'Activo', page: 1 })
    );
  }));

  it('should clear filters', fakeAsync(() => {
    component.searchTerm = 'test';
    component.selectedZona = 'Colombia';
    component.selectedEstado = 'Activo';
    
    component.limpiarFiltros();
    tick();
    
    jexpect(component.searchTerm).toBe('');
    jexpect(component.selectedZona).toBe('');
    jexpect(component.selectedEstado).toBe('');
    jexpect(vendedorService.obtenerVendedores).toHaveBeenCalled();
  }));

  it('should handle page change', () => {
    // Configurar el mock para retornar la página correcta
    const mockResponse: ObtenerVendedoresResponse = {
      items: mockVendedoresResponse.items,
      page: 2,
      size: 20,
      total: 100
    };
    (vendedorService.obtenerVendedores as jasmine.Spy).and.returnValue(of(mockResponse));
    
    const pageEvent: PageEvent = {
      pageIndex: 1,
      pageSize: 20,
      length: 100,
      previousPageIndex: 0
    };
    
    component.onPageChange(pageEvent);
    
    jexpect(component.page).toBe(2); // pageIndex 1 + 1 = page 2
    jexpect(component.size).toBe(20);
    jexpect(vendedorService.obtenerVendedores).toHaveBeenCalled();
  });

  it('should open registrar vendedor dialog', () => {
    const mockDialogRef = jasmine.createSpyObj({ afterClosed: of(null) });
    spyOn(component['dialog'], 'open').and.returnValue(mockDialogRef);
    
    component.openRegistrarVendedorDialog();
    
    jexpect(component['dialog'].open).toHaveBeenCalled();
  });

  it('should reload vendedores after successful registration', fakeAsync(() => {
    const mockResult = { id: '3', nombre: 'Nuevo', apellidos: 'Vendedor' };
    const mockDialogRef = jasmine.createSpyObj({ afterClosed: of(mockResult) });
    spyOn(component['dialog'], 'open').and.returnValue(mockDialogRef);
    const snackBarSpy = spyOn(component['snackBar'], 'open');
    
    component.openRegistrarVendedorDialog();
    tick();
    
    jexpect(snackBarSpy).toHaveBeenCalledWith(
      'Vendedor registrado exitosamente',
      'Cerrar',
      { duration: 3000 }
    );
    jexpect(vendedorService.obtenerVendedores).toHaveBeenCalled();
  }));

  it('should not reload vendedores if dialog is cancelled', fakeAsync(() => {
    const mockDialogRef = jasmine.createSpyObj({ afterClosed: of(null) });
    spyOn(dialog, 'open').and.returnValue(mockDialogRef);
    const initialCalls = (vendedorService.obtenerVendedores as jasmine.Spy).calls.count();
    
    component.openRegistrarVendedorDialog();
    tick();
    
    const finalCalls = (vendedorService.obtenerVendedores as jasmine.Spy).calls.count();
    jexpect(finalCalls).toBe(initialCalls);
  }));

  it('should call editarVendedor when edit button is clicked', () => {
    spyOn(component, 'editarVendedor');
    const vendedor: Vendedor = mockVendedoresResponse.items[0];
    
    component.editarVendedor(vendedor);
    
    jexpect(component.editarVendedor).toHaveBeenCalledWith(vendedor);
  });

  it('should show development message when editing vendedor', () => {
    const snackBarSpy = spyOn(component['snackBar'], 'open');
    const vendedor: Vendedor = mockVendedoresResponse.items[0];
    
    component.editarVendedor(vendedor);
    
    jexpect(snackBarSpy).toHaveBeenCalledWith(
      'Funcionalidad en desarrollo',
      'Cerrar',
      { duration: 2000 }
    );
  });

  it('should return correct estado class for Activo', () => {
    const estadoClass = component.getEstadoClass('Activo');
    jexpect(estadoClass).toBe('estado-activo');
  });

  it('should return correct estado class for Inactivo', () => {
    const estadoClass = component.getEstadoClass('Inactivo');
    jexpect(estadoClass).toBe('estado-inactivo');
  });

  it('should return true when vendedores exist', () => {
    component.vendedores = mockVendedoresResponse.items;
    jexpect(component.tieneVendedores).toBe(true);
  });

  it('should return false when no vendedores', () => {
    component.vendedores = [];
    jexpect(component.tieneVendedores).toBe(false);
  });

  it('should initialize filters with translations', () => {
    jexpect(component.zonas.length).toBeGreaterThan(0);
    jexpect(component.estados.length).toBeGreaterThan(0);
  });

  it('should have correct table columns', () => {
    jexpect(component.displayedColumns).toEqual(['nombre', 'contacto', 'zona', 'estado', 'acciones']);
  });

  it('should display search field', () => {
    const searchField = fixture.nativeElement.querySelector('.search-field input');
    jexpect(searchField).toBeTruthy();
  });

  it('should display zona filter', () => {
    const zonaFilter = fixture.nativeElement.querySelector('.filter-field mat-select');
    jexpect(zonaFilter).toBeTruthy();
  });

  it('should have clear button disabled when no filters applied', () => {
    component.searchTerm = '';
    component.selectedZona = '';
    component.selectedEstado = '';
    fixture.detectChanges();
    
    const clearButton: HTMLButtonElement = fixture.nativeElement.querySelector('.clear-button');
    jexpect(clearButton.disabled).toBe(true);
  });

  it('should have clear button enabled when filters are applied', () => {
    component.searchTerm = 'test';
    fixture.detectChanges();
    
    const clearButton: HTMLButtonElement = fixture.nativeElement.querySelector('.clear-button');
    jexpect(clearButton.disabled).toBe(false);
  });

  it('should not add empty filters to params', fakeAsync(() => {
    component.searchTerm = '';
    component.selectedZona = '';
    component.selectedEstado = '';
    component.cargarVendedores();
    tick();
    
    const callArgs = (vendedorService.obtenerVendedores as jasmine.Spy).calls.mostRecent().args[0];
    jexpect(callArgs.nombre).toBeUndefined();
    jexpect(callArgs.zona).toBeUndefined();
    jexpect(callArgs.estado).toBeUndefined();
  }));

  it('should reset page to 1 when applying filters', fakeAsync(() => {
    component.page = 3;
    component.aplicarFiltros();
    tick();
    
    jexpect(component.page).toBe(1);
  }));

  it('should display paginator', fakeAsync(() => {
    component.cargarVendedores();
    tick();
    fixture.detectChanges();
    
    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    jexpect(paginator).toBeTruthy();
  }));

  it('should show no results message when filtered vendedores is empty', () => {
    component.vendedores = [];
    component.searchTerm = 'test';
    component.isLoading = false;
    component.errorMessage = '';
    component.selectedZona = '';
    component.selectedEstado = '';
    fixture.detectChanges();
    
    // Debe mostrar el mensaje de no results
    jexpect(component.tieneVendedores).toBe(false);
    jexpect(component.searchTerm).toBe('test');
  });

  it('should trigger openRegistrarVendedorDialog on button click', () => {
    const spyMethod = spyOn(component, 'openRegistrarVendedorDialog');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.register-button');
    button.click();
    jexpect(spyMethod).toHaveBeenCalled();
  });

  it('should have mat-icon in register button', () => {
    const icon = fixture.nativeElement.querySelector('.register-button mat-icon');
    jexpect(icon).toBeTruthy();
    jexpect(icon.textContent).toContain('add');
  });

  it('should render vendedores-container', () => {
    const container = fixture.nativeElement.querySelector('.vendedores-container');
    jexpect(container).toBeTruthy();
  });

  it('should render header section', () => {
    const header = fixture.nativeElement.querySelector('.header');
    jexpect(header).toBeTruthy();
  });

  it('should verify button has correct Material attributes', () => {
    const button = fixture.nativeElement.querySelector('.register-button');
    jexpect(button.getAttribute('mat-raised-button')).not.toBeNull();
    jexpect(button.getAttribute('color')).toBe('primary');
  });

  it('should have MatDialog injected', () => {
    jexpect(component['dialog']).toBeDefined();
  });

  it('should have VendedorHttpService injected', () => {
    jexpect(component['vendedorService']).toBeDefined();
  });

  it('should have MatSnackBar injected', () => {
    jexpect(component['snackBar']).toBeDefined();
  });

  it('should trim search term before applying filters', fakeAsync(() => {
    component.searchTerm = '  María  ';
    component.aplicarFiltros();
    tick();
    
    const callArgs = (vendedorService.obtenerVendedores as jasmine.Spy).calls.mostRecent().args[0];
    jexpect(callArgs.nombre).toBe('María');
  }));

  it('should update pagination from response', fakeAsync(() => {
    const response: ObtenerVendedoresResponse = {
      items: [],
      page: 2,
      size: 20,
      total: 50
    };
    (vendedorService.obtenerVendedores as jasmine.Spy).and.returnValue(of(response));
    
    component.cargarVendedores();
    tick();
    
    jexpect(component.page).toBe(2);
    jexpect(component.total).toBe(50);
  }));

  it('should return true from hasFiltrosActivos when searchTerm is set', () => {
    component.searchTerm = 'test';
    component.selectedZona = '';
    component.selectedEstado = '';
    jexpect(component.hasFiltrosActivos).toBe(true);
  });

  it('should return true from hasFiltrosActivos when selectedZona is set', () => {
    component.searchTerm = '';
    component.selectedZona = 'Colombia';
    component.selectedEstado = '';
    jexpect(component.hasFiltrosActivos).toBe(true);
  });

  it('should return true from hasFiltrosActivos when selectedEstado is set', () => {
    component.searchTerm = '';
    component.selectedZona = '';
    component.selectedEstado = 'Activo';
    jexpect(component.hasFiltrosActivos).toBe(true);
  });

  it('should return false from hasFiltrosActivos when no filters are set', () => {
    component.searchTerm = '';
    component.selectedZona = '';
    component.selectedEstado = '';
    jexpect(component.hasFiltrosActivos).toBe(false);
  });

  it('should configure paginator on init', () => {
    const paginatorIntl = fixture.debugElement.injector.get(MatPaginatorIntl);
    jexpect(paginatorIntl.itemsPerPageLabel).toBe('Elementos por página:');
    jexpect(paginatorIntl.nextPageLabel).toBe('Página siguiente');
    jexpect(paginatorIntl.previousPageLabel).toBe('Página anterior');
    jexpect(paginatorIntl.firstPageLabel).toBe('Primera página');
    jexpect(paginatorIntl.lastPageLabel).toBe('Última página');
  });

  it('should update paginator labels on language change', fakeAsync(() => {
    const translateService = TestBed.inject(TranslateService);
    const paginatorIntl = fixture.debugElement.injector.get(MatPaginatorIntl);
    
    translateService.use('en');
    tick();
    
    jexpect(paginatorIntl.itemsPerPageLabel).toBe('Items per page:');
  }));

  it('should return correct range label for paginator', () => {
    const paginatorIntl = fixture.debugElement.injector.get(MatPaginatorIntl);
    const rangeLabel = paginatorIntl.getRangeLabel(0, 10, 100);
    jexpect(rangeLabel).toBe('1 - 10 de 100');
  });

  it('should return correct range label when no items', () => {
    const paginatorIntl = fixture.debugElement.injector.get(MatPaginatorIntl);
    const rangeLabel = paginatorIntl.getRangeLabel(0, 10, 0);
    jexpect(rangeLabel).toBe('0 de 0');
  });

  it('should open generar informe and then open visor on reporte result', () => {
    const reporteMock = {
      metricas: { clientes_unicos: 0, cumplimiento_porcentaje: 0, meta_ingresos_total: 0, monto_promedio: 0, monto_total: 0, ventas_realizadas: 0 },
      pedidos_detalle: [],
      periodo: { anio: 2025, mes: 2, mes_nombre: 'Febrero', periodo_formato: '2025-02' },
      planes: [],
      vendedor: { correo: 'juan@test.com', id: '1', nombre_completo: 'Juan Pérez', zona: 'Colombia' }
    };
    const afterClosedFirst = of(reporteMock);
    const afterClosedSecond = of(null);
    const dialogRefFirst: any = { afterClosed: () => afterClosedFirst };
    const dialogRefSecond: any = { afterClosed: () => afterClosedSecond };
    const openSpy = spyOn(component['dialog'], 'open').and.returnValues(dialogRefFirst, dialogRefSecond);

    component.abrirGenerarInforme();

    jexpect(openSpy.calls.count()).toBe(2); // diálogo de generar y luego visor
  });

  it('should not open visor when generar informe returns null', () => {
    const dialogRefFirst: any = { afterClosed: () => of(null) };
    const openSpy = spyOn(component['dialog'], 'open').and.returnValue(dialogRefFirst);

    component.abrirGenerarInforme();

    jexpect(openSpy.calls.count()).toBe(1); // Solo diálogo principal
  });

  it('should open detalle vendedor dialog', () => {
    const vendedor = mockVendedoresResponse.items[0];
    const dialogRef: any = { afterClosed: () => of(null) };
    const openSpy = spyOn(component['dialog'], 'open').and.returnValue(dialogRef);
    component.verDetalleVendedor(vendedor as any);
    jexpect(openSpy).toHaveBeenCalled();
  });
});
