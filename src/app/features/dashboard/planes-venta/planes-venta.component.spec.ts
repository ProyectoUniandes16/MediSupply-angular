import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { PlanesVentaComponent } from './planes-venta.component';
import { FakeTranslateLoader } from '../../../testing/i18n-testing.helper';
import { PageEvent } from '@angular/material/paginator';

import { PlanVentaHttpService } from '../../../core/services/plan-venta-http.service';
import { VendedorHttpService } from '../../../core/services/vendedor-http.service';
import { ObtenerPlanesVentaResponse, PlanVenta } from '../../../core/models/plan-venta.models';
import { ObtenerVendedoresResponse } from '../../../core/models/vendedor.models';

describe('PlanesVentaComponent', () => {
  let component: PlanesVentaComponent;
  let fixture: ComponentFixture<PlanesVentaComponent>;
  let planService: jasmine.SpyObj<PlanVentaHttpService>;
  let vendedorService: jasmine.SpyObj<VendedorHttpService>;

  const mockPlanesResponse: ObtenerPlanesVentaResponse = {
    items: [
      {
        id: 'p1',
        nombre_plan: 'Plan Q1 2025',
        estado: 'activo',
        fecha_creacion: '2025-01-01',
        fecha_actualizacion: '2025-01-01',
        gerente_id: 'g1',
        meta_clientes_nuevos: 3,
        meta_ingresos: 10000000,
        meta_visitas: 10,
        periodo: '2025-01',
        vendedores: [
          { id: 'v1', nombre: 'Ana', apellidos: 'Díaz', correo: 'ana@medy.com', zona: 'Colombia' },
          { id: 'v2', nombre: 'Luis', apellidos: 'Cruz', correo: 'luis@medy.com', zona: 'México' }
        ],
        vendedores_ids: ['v1', 'v2']
      }
    ],
    page: 1,
    pages: 1,
    size: 10,
    total: 1
  };

  const mockVendedoresResponse: ObtenerVendedoresResponse = {
    items: [
      { id: 'v1', nombre: 'Ana', apellidos: 'Díaz', correo: 'ana@medy.com', telefono: '+57 123', zona: 'Colombia', estado: 'Activo', fechaCreacion: '', fechaActualizacion: '', usuarioCreacion: '', usuarioActualizacion: '' },
      { id: 'v2', nombre: 'Luis', apellidos: 'Cruz', correo: 'luis@medy.com', telefono: '+52 456', zona: 'México', estado: 'Activo', fechaCreacion: '', fechaActualizacion: '', usuarioCreacion: '', usuarioActualizacion: '' }
    ],
    page: 1,
    size: 100,
    total: 2
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlanesVentaComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeTranslateLoader } })
      ],
      providers: [
        provideHttpClient(),
        TranslateService,
        { provide: PlanVentaHttpService, useValue: jasmine.createSpyObj('PlanVentaHttpService', ['obtenerPlanesVenta']) },
        { provide: VendedorHttpService, useValue: jasmine.createSpyObj('VendedorHttpService', ['obtenerVendedores']) }
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.use('es');

    planService = TestBed.inject(PlanVentaHttpService) as jasmine.SpyObj<PlanVentaHttpService>;
    vendedorService = TestBed.inject(VendedorHttpService) as jasmine.SpyObj<VendedorHttpService>;

    planService.obtenerPlanesVenta.and.returnValue(of(mockPlanesResponse));
    vendedorService.obtenerVendedores.and.returnValue(of(mockVendedoresResponse));

    fixture = TestBed.createComponent(PlanesVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call services on init', () => {
    expect(vendedorService.obtenerVendedores).toHaveBeenCalled();
    expect(planService.obtenerPlanesVenta).toHaveBeenCalled();
  });

  it('should load planes successfully', fakeAsync(() => {
    component.cargarPlanesVenta();
    tick();

    expect(component.planesVenta.length).toBe(1);
    expect(component.total).toBe(1);
    expect(component.pages).toBe(1);
    expect(component.isLoading).toBe(false);
  }));

  it('should handle error when loading planes', fakeAsync(() => {
    planService.obtenerPlanesVenta.and.returnValue(throwError(() => new Error('boom')));
    const snackSpy = spyOn<any>(component['snackBar'], 'open');

    component.cargarPlanesVenta();
    tick();

    expect(component.errorMessage).toBeTruthy();
    expect(component.isLoading).toBe(false);
    expect(snackSpy).toHaveBeenCalled();
  }));

  it('should apply search filter with debounce', fakeAsync(() => {
    planService.obtenerPlanesVenta.calls.reset();
    component.searchTerm = 'Q1';
    component.aplicarFiltros();
    tick(300);

    expect(planService.obtenerPlanesVenta).toHaveBeenCalledWith(jasmine.objectContaining({
      page: 1,
      size: component.size,
      nombre_plan: 'Q1'
    }));
  }));

  it('should apply vendedor and estado filters', fakeAsync(() => {
    planService.obtenerPlanesVenta.calls.reset();
    component.selectedVendedor = 'v1';
    component.selectedEstado = 'activo';
    component.aplicarFiltros();
    tick(300);

    const args = planService.obtenerPlanesVenta.calls.mostRecent()?.args?.[0] as any;
    expect(args).toBeTruthy();
    expect(args.vendedor_id).toBe('v1');
    expect(args.estado).toBe('activo');
    expect(args.page).toBe(1);
  }));

  it('should clear filters', fakeAsync(() => {
    component.searchTerm = 'x';
    component.selectedVendedor = 'v1';
    component.selectedEstado = 'activo';

    component.limpiarFiltros();
    tick();

    expect(component.searchTerm).toBe('');
    expect(component.selectedVendedor).toBe('');
    expect(component.selectedEstado).toBe('');
    expect(planService.obtenerPlanesVenta).toHaveBeenCalled();
  }));

  it('should handle page change', () => {
    const event: PageEvent = { pageIndex: 2, pageSize: 20, length: 100, previousPageIndex: 1 };
    component.onPageChange(event);

    expect(component.page).toBe(3);
    expect(component.size).toBe(20);
    expect(planService.obtenerPlanesVenta).toHaveBeenCalled();
  });

  it('should compute vendedores names', () => {
    const plan: PlanVenta = mockPlanesResponse.items[0] as any;
    const names = component.getVendedoresNombres(plan);
    expect(names).toContain('Ana Díaz');
    expect(names).toContain('Luis Cruz');
  });

  it('should format id and amount correctly', () => {
    component.page = 1;
    component.size = 10;
    const id = component.getIdPlanFormateado(mockPlanesResponse.items[0] as any, 0);
    expect(id).toBe('PV-001');

    const formatted = component.formatearMonto(1500000);
    expect(formatted).toContain('$');
  });

  it('should return estado class', () => {
    expect(component.getEstadoClass('activo')).toBe('estado-activo');
    expect(component.getEstadoClass('inactivo')).toBe('estado-inactivo');
    expect(component.getEstadoClass('pendiente')).toBe('estado-pendiente');
  });

  it('should render filters and actions', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.filters-bar')).toBeTruthy();
    expect(el.querySelector('.search-field input')).toBeTruthy();
    expect(el.querySelectorAll('.filter-field').length).toBeGreaterThan(0);
    expect(el.querySelector('.clear-button')).toBeTruthy();
  });

  it('should render table and paginator when data present', fakeAsync(() => {
    component.planesVenta = mockPlanesResponse.items as any;
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.planes-table')).toBeTruthy();
    expect(el.querySelector('mat-paginator')).toBeTruthy();
  }));

  it('should show empty state when no data and no filters', () => {
    component.planesVenta = [];
    component.isLoading = false;
    component.errorMessage = '';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.empty-state')).toBeTruthy();
  });

  it('should show no-results when filters applied with no items', () => {
    component.planesVenta = [];
    component.searchTerm = 'x';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.no-results')).toBeTruthy();
  });

  it('should open agregar plan dialog and reload on success', fakeAsync(() => {
    const dialogRef = { afterClosed: () => of({ id: 'newId' }) } as any;
    spyOn(component['dialog'], 'open').and.returnValue(dialogRef);
    const snackSpy = spyOn(component['snackBar'], 'open');

    component.openAgregarPlanDialog();
    tick();

    expect(snackSpy).toHaveBeenCalled();
    expect(planService.obtenerPlanesVenta).toHaveBeenCalled();
  }));

  it('should not reload when dialog is cancelled', fakeAsync(() => {
    const dialogRef = { afterClosed: () => of(null) } as any;
    spyOn(component['dialog'], 'open').and.returnValue(dialogRef);
    planService.obtenerPlanesVenta.calls.reset();

    component.openAgregarPlanDialog();
    tick();

    expect(planService.obtenerPlanesVenta).not.toHaveBeenCalled();
  }));
});
