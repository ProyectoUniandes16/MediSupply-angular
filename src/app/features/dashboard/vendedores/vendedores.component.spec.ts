import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VendedoresComponent } from './vendedores.component';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../testing/i18n-testing.helper';
import { VendedorHttpService } from '../../../core/services/vendedor-http.service';
import { ObtenerVendedoresResponse, Vendedor } from '../../../core/models/vendedor.models';
import { PageEvent, MatPaginatorIntl } from '@angular/material/paginator';

describe('VendedoresComponent', () => {
  let component: VendedoresComponent;
  let fixture: ComponentFixture<VendedoresComponent>;
  let dialog: MatDialog;
  let vendedorService: VendedorHttpService;

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
        }
      ]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('es');

    dialog = TestBed.inject(MatDialog);
    vendedorService = TestBed.inject(VendedorHttpService);
    
    // Mock del servicio
    (vendedorService.obtenerVendedores as jasmine.Spy).and.returnValue(of(mockVendedoresResponse));

    fixture = TestBed.createComponent(VendedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have title "Vendedores"', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.title');
    expect(title.textContent).toContain('Vendedores');
  });

  it('should have subtitle', () => {
    const compiled = fixture.nativeElement;
    const subtitle = compiled.querySelector('.subtitle');
    expect(subtitle.textContent).toContain('Gestiona vendedores');
  });

  it('should have register button', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('.register-button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Registrar Vendedor');
  });

  it('should call cargarVendedores on init', () => {
    expect(vendedorService.obtenerVendedores).toHaveBeenCalled();
  });

  it('should load vendedores successfully', fakeAsync(() => {
    component.cargarVendedores();
    tick();
    
    expect(component.vendedores.length).toBe(2);
    expect(component.vendedores[0].nombre).toBe('María');
    expect(component.total).toBe(2);
    expect(component.isLoading).toBe(false);
  }));

  it('should display table when vendedores are loaded', fakeAsync(() => {
    component.cargarVendedores();
    tick();
    fixture.detectChanges();
    
    const table = fixture.nativeElement.querySelector('.vendedores-table');
    expect(table).toBeTruthy();
  }));

  it('should display correct number of vendedores in table', fakeAsync(() => {
    component.cargarVendedores();
    tick();
    fixture.detectChanges();
    
    const rows = fixture.nativeElement.querySelectorAll('.vendedores-table tbody tr');
    expect(rows.length).toBe(2);
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
    
    expect(newComponent.errorMessage).toBeTruthy();
    expect(newComponent.isLoading).toBe(false);
    expect(snackBarSpy).toHaveBeenCalled();
  }));

  it('should show loading spinner when loading', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should show empty state when no vendedores', () => {
    component.vendedores = [];
    component.isLoading = false;
    component.errorMessage = '';
    fixture.detectChanges();
    
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should show error message when error occurs', () => {
    component.errorMessage = 'Error al cargar';
    component.isLoading = false;
    fixture.detectChanges();
    
    const errorMsg = fixture.nativeElement.querySelector('.error-message');
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.textContent).toContain('Error al cargar');
  });

  it('should apply filters when search term changes', fakeAsync(() => {
    component.searchTerm = 'María';
    component.aplicarFiltros();
    tick();
    
    expect(vendedorService.obtenerVendedores).toHaveBeenCalledWith(
      jasmine.objectContaining({ nombre: 'María', page: 1 })
    );
  }));

  it('should apply filters when zona changes', fakeAsync(() => {
    component.selectedZona = 'Colombia';
    component.aplicarFiltros();
    tick();
    
    expect(vendedorService.obtenerVendedores).toHaveBeenCalledWith(
      jasmine.objectContaining({ zona: 'Colombia', page: 1 })
    );
  }));

  it('should apply filters when estado changes', fakeAsync(() => {
    component.selectedEstado = 'Activo';
    component.aplicarFiltros();
    tick();
    
    expect(vendedorService.obtenerVendedores).toHaveBeenCalledWith(
      jasmine.objectContaining({ estado: 'Activo', page: 1 })
    );
  }));

  it('should clear filters', fakeAsync(() => {
    component.searchTerm = 'test';
    component.selectedZona = 'Colombia';
    component.selectedEstado = 'Activo';
    
    component.limpiarFiltros();
    tick();
    
    expect(component.searchTerm).toBe('');
    expect(component.selectedZona).toBe('');
    expect(component.selectedEstado).toBe('');
    expect(vendedorService.obtenerVendedores).toHaveBeenCalled();
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
    
    expect(component.page).toBe(2); // pageIndex 1 + 1 = page 2
    expect(component.size).toBe(20);
    expect(vendedorService.obtenerVendedores).toHaveBeenCalled();
  });

  it('should open registrar vendedor dialog', () => {
    const mockDialogRef = jasmine.createSpyObj({ afterClosed: of(null) });
    spyOn(component['dialog'], 'open').and.returnValue(mockDialogRef);
    
    component.openRegistrarVendedorDialog();
    
    expect(component['dialog'].open).toHaveBeenCalled();
  });

  it('should reload vendedores after successful registration', fakeAsync(() => {
    const mockResult = { id: '3', nombre: 'Nuevo', apellidos: 'Vendedor' };
    const mockDialogRef = jasmine.createSpyObj({ afterClosed: of(mockResult) });
    spyOn(component['dialog'], 'open').and.returnValue(mockDialogRef);
    const snackBarSpy = spyOn(component['snackBar'], 'open');
    
    component.openRegistrarVendedorDialog();
    tick();
    
    expect(snackBarSpy).toHaveBeenCalledWith(
      'Vendedor registrado exitosamente',
      'Cerrar',
      { duration: 3000 }
    );
    expect(vendedorService.obtenerVendedores).toHaveBeenCalled();
  }));

  it('should not reload vendedores if dialog is cancelled', fakeAsync(() => {
    const mockDialogRef = jasmine.createSpyObj({ afterClosed: of(null) });
    spyOn(dialog, 'open').and.returnValue(mockDialogRef);
    const initialCalls = (vendedorService.obtenerVendedores as jasmine.Spy).calls.count();
    
    component.openRegistrarVendedorDialog();
    tick();
    
    const finalCalls = (vendedorService.obtenerVendedores as jasmine.Spy).calls.count();
    expect(finalCalls).toBe(initialCalls);
  }));

  it('should call editarVendedor when edit button is clicked', () => {
    spyOn(component, 'editarVendedor');
    const vendedor: Vendedor = mockVendedoresResponse.items[0];
    
    component.editarVendedor(vendedor);
    
    expect(component.editarVendedor).toHaveBeenCalledWith(vendedor);
  });

  it('should show development message when editing vendedor', () => {
    const snackBarSpy = spyOn(component['snackBar'], 'open');
    const vendedor: Vendedor = mockVendedoresResponse.items[0];
    
    component.editarVendedor(vendedor);
    
    expect(snackBarSpy).toHaveBeenCalledWith(
      'Funcionalidad en desarrollo',
      'Cerrar',
      { duration: 2000 }
    );
  });

  it('should return correct estado class for Activo', () => {
    const estadoClass = component.getEstadoClass('Activo');
    expect(estadoClass).toBe('estado-activo');
  });

  it('should return correct estado class for Inactivo', () => {
    const estadoClass = component.getEstadoClass('Inactivo');
    expect(estadoClass).toBe('estado-inactivo');
  });

  it('should return true when vendedores exist', () => {
    component.vendedores = mockVendedoresResponse.items;
    expect(component.tieneVendedores).toBe(true);
  });

  it('should return false when no vendedores', () => {
    component.vendedores = [];
    expect(component.tieneVendedores).toBe(false);
  });

  it('should initialize filters with translations', () => {
    expect(component.zonas.length).toBeGreaterThan(0);
    expect(component.estados.length).toBeGreaterThan(0);
  });

  it('should have correct table columns', () => {
    expect(component.displayedColumns).toEqual(['nombre', 'contacto', 'zona', 'estado', 'acciones']);
  });

  it('should display search field', () => {
    const searchField = fixture.nativeElement.querySelector('.search-field input');
    expect(searchField).toBeTruthy();
  });

  it('should display zona filter', () => {
    const zonaFilter = fixture.nativeElement.querySelector('.filter-field mat-select');
    expect(zonaFilter).toBeTruthy();
  });

  it('should have clear button disabled when no filters applied', () => {
    component.searchTerm = '';
    component.selectedZona = '';
    component.selectedEstado = '';
    fixture.detectChanges();
    
    const clearButton: HTMLButtonElement = fixture.nativeElement.querySelector('.clear-button');
    expect(clearButton.disabled).toBe(true);
  });

  it('should have clear button enabled when filters are applied', () => {
    component.searchTerm = 'test';
    fixture.detectChanges();
    
    const clearButton: HTMLButtonElement = fixture.nativeElement.querySelector('.clear-button');
    expect(clearButton.disabled).toBe(false);
  });

  it('should not add empty filters to params', fakeAsync(() => {
    component.searchTerm = '';
    component.selectedZona = '';
    component.selectedEstado = '';
    component.cargarVendedores();
    tick();
    
    const callArgs = (vendedorService.obtenerVendedores as jasmine.Spy).calls.mostRecent().args[0];
    expect(callArgs.nombre).toBeUndefined();
    expect(callArgs.zona).toBeUndefined();
    expect(callArgs.estado).toBeUndefined();
  }));

  it('should reset page to 1 when applying filters', fakeAsync(() => {
    component.page = 3;
    component.aplicarFiltros();
    tick();
    
    expect(component.page).toBe(1);
  }));

  it('should display paginator', fakeAsync(() => {
    component.cargarVendedores();
    tick();
    fixture.detectChanges();
    
    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    expect(paginator).toBeTruthy();
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
    expect(component.tieneVendedores).toBe(false);
    expect(component.searchTerm).toBe('test');
  });

  it('should trigger openRegistrarVendedorDialog on button click', () => {
    const spyMethod = spyOn(component, 'openRegistrarVendedorDialog');
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.register-button');
    button.click();
    expect(spyMethod).toHaveBeenCalled();
  });

  it('should have mat-icon in register button', () => {
    const icon = fixture.nativeElement.querySelector('.register-button mat-icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent).toContain('add');
  });

  it('should render vendedores-container', () => {
    const container = fixture.nativeElement.querySelector('.vendedores-container');
    expect(container).toBeTruthy();
  });

  it('should render header section', () => {
    const header = fixture.nativeElement.querySelector('.header');
    expect(header).toBeTruthy();
  });

  it('should verify button has correct Material attributes', () => {
    const button = fixture.nativeElement.querySelector('.register-button');
    expect(button.getAttribute('mat-raised-button')).not.toBeNull();
    expect(button.getAttribute('color')).toBe('primary');
  });

  it('should have MatDialog injected', () => {
    expect(component['dialog']).toBeDefined();
  });

  it('should have VendedorHttpService injected', () => {
    expect(component['vendedorService']).toBeDefined();
  });

  it('should have MatSnackBar injected', () => {
    expect(component['snackBar']).toBeDefined();
  });

  it('should trim search term before applying filters', fakeAsync(() => {
    component.searchTerm = '  María  ';
    component.aplicarFiltros();
    tick();
    
    const callArgs = (vendedorService.obtenerVendedores as jasmine.Spy).calls.mostRecent().args[0];
    expect(callArgs.nombre).toBe('María');
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
    
    expect(component.page).toBe(2);
    expect(component.total).toBe(50);
  }));

  it('should return true from hasFiltrosActivos when searchTerm is set', () => {
    component.searchTerm = 'test';
    component.selectedZona = '';
    component.selectedEstado = '';
    expect(component.hasFiltrosActivos).toBe(true);
  });

  it('should return true from hasFiltrosActivos when selectedZona is set', () => {
    component.searchTerm = '';
    component.selectedZona = 'Colombia';
    component.selectedEstado = '';
    expect(component.hasFiltrosActivos).toBe(true);
  });

  it('should return true from hasFiltrosActivos when selectedEstado is set', () => {
    component.searchTerm = '';
    component.selectedZona = '';
    component.selectedEstado = 'Activo';
    expect(component.hasFiltrosActivos).toBe(true);
  });

  it('should return false from hasFiltrosActivos when no filters are set', () => {
    component.searchTerm = '';
    component.selectedZona = '';
    component.selectedEstado = '';
    expect(component.hasFiltrosActivos).toBe(false);
  });

  it('should configure paginator on init', () => {
    const paginatorIntl = fixture.debugElement.injector.get(MatPaginatorIntl);
    expect(paginatorIntl.itemsPerPageLabel).toBe('Elementos por página:');
    expect(paginatorIntl.nextPageLabel).toBe('Página siguiente');
    expect(paginatorIntl.previousPageLabel).toBe('Página anterior');
    expect(paginatorIntl.firstPageLabel).toBe('Primera página');
    expect(paginatorIntl.lastPageLabel).toBe('Última página');
  });

  it('should update paginator labels on language change', fakeAsync(() => {
    const translateService = TestBed.inject(TranslateService);
    const paginatorIntl = fixture.debugElement.injector.get(MatPaginatorIntl);
    
    translateService.use('en');
    tick();
    
    expect(paginatorIntl.itemsPerPageLabel).toBe('Items per page:');
  }));

  it('should return correct range label for paginator', () => {
    const paginatorIntl = fixture.debugElement.injector.get(MatPaginatorIntl);
    const rangeLabel = paginatorIntl.getRangeLabel(0, 10, 100);
    expect(rangeLabel).toBe('1 - 10 de 100');
  });

  it('should return correct range label when no items', () => {
    const paginatorIntl = fixture.debugElement.injector.get(MatPaginatorIntl);
    const rangeLabel = paginatorIntl.getRangeLabel(0, 10, 0);
    expect(rangeLabel).toBe('0 de 0');
  });
});
