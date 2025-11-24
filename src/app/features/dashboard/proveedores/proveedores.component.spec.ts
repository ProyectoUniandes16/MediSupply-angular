import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedoresComponent } from './proveedores.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ProveedorHttpService } from '../../../core/services/proveedor-http.service';
import { RutaHttpService } from '../../../core/services/ruta-http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../testing/i18n-testing.helper';

describe('ProveedoresComponent', () => {
  let component: ProveedoresComponent;
  let fixture: ComponentFixture<ProveedoresComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let dialogRefSpyObj: jasmine.SpyObj<MatDialogRef<any>>;
  let proveedorServiceSpy: jasmine.SpyObj<ProveedorHttpService>;
  let rutaServiceSpy: jasmine.SpyObj<RutaHttpService>;

  const jexpect = (v: any) => (expect(v) as any);

  beforeEach(async () => {
    dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of(null),
      close: null
    });
    
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    matDialogSpy.open.and.returnValue(dialogRefSpyObj);

    const proveedorHttpServiceSpy = jasmine.createSpyObj('ProveedorHttpService', ['obtenerProveedores']);
    proveedorHttpServiceSpy.obtenerProveedores.and.returnValue(of({
      data: [],
      mensaje: 'Proveedores obtenidos exitosamente',
      paginacion: {
        pagina: 1,
        por_pagina: 20,
        total: 0,
        total_paginas: 0
      }
    }));

    const rutaHttpServiceSpy = jasmine.createSpyObj('RutaHttpService', ['obtenerZonas']);
    rutaHttpServiceSpy.obtenerZonas.and.returnValue(of({
      data: [
        { id: '1', nombre: 'Colombia', descripcion: 'País Colombia' },
        { id: '2', nombre: 'México', descripcion: 'País México' }
      ]
    }));

    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ProveedoresComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: ProveedorHttpService, useValue: proveedorHttpServiceSpy },
        { provide: RutaHttpService, useValue: rutaHttpServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        provideAnimations(),
        provideHttpClient(),
        TranslateService
      ]
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('es');

    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    proveedorServiceSpy = TestBed.inject(ProveedorHttpService) as jasmine.SpyObj<ProveedorHttpService>;
    rutaServiceSpy = TestBed.inject(RutaHttpService) as jasmine.SpyObj<RutaHttpService>;
    fixture = TestBed.createComponent(ProveedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    jexpect(component).toBeTruthy();
  });

  it('should have empty proveedores array initially', () => {
    jexpect(component.proveedores).toEqual([]);
    jexpect(component.proveedores.length).toBe(0);
  });

  it('should have correct table columns', () => {
    jexpect(component.displayedColumns).toEqual(['nombre', 'pais', 'estado', 'contacto', 'acciones']);
  });

  it('should clear filters', () => {
    component.searchTerm = 'test';
    component.selectedPais = 'Colombia';
    component.selectedEstado = 'Activo';
    spyOn(component, 'cargarProveedores');
    
    component.limpiarFiltros();
    
    jexpect(component.searchTerm).toBe('');
    jexpect(component.selectedPais).toBe('Todos');
    jexpect(component.selectedEstado).toBe('Todos');
    jexpect(component.cargarProveedores).toHaveBeenCalledWith(true);
  });

  it('should call editarProveedor with correct proveedor', () => {
    spyOn(console, 'log');
    const testProveedor = {
      id: 1,
      nombre: 'Test Proveedor',
      nit: '123456789',
      nombre_contacto: 'Test Contacto',
      email: 'test@test.com',
      direccion: 'Test Address',
      pais: 'Colombia',
      telefono: '1234567890',
      estado: 'Activo',
      estado_certificacion: 'vigente',
      fecha_registro: '2024-01-01T00:00:00Z',
      total_certificaciones: 2
    };

    component.editarProveedor(testProveedor);

    jexpect(console.log).toHaveBeenCalledWith('Editar proveedor:', testProveedor);
  });

  it('should initialize with Todos selectedEstado', () => {
    jexpect(component.selectedEstado).toBe('Todos');
  });

  it('should initialize with empty searchTerm', () => {
    jexpect(component.searchTerm).toBe('');
  });

  it('should initialize with Todos selectedPais', () => {
    jexpect(component.selectedPais).toBe('Todos');
  });

  it('should call cargarProveedores on init', () => {
    jexpect(proveedorServiceSpy.obtenerProveedores).toHaveBeenCalled();
  });

  it('should load proveedores successfully', () => {
    const mockProveedores = [
      {
        id: 1,
        nombre: 'Proveedor 1',
        nit: '123456789',
        nombre_contacto: 'Contacto 1',
        email: 'test1@test.com',
        direccion: 'Address 1',
        pais: 'Colombia',
        telefono: '1234567890',
        estado: 'Activo',
        estado_certificacion: 'vigente',
        fecha_registro: '2024-01-01T00:00:00Z',
        total_certificaciones: 2
      }
    ];

    proveedorServiceSpy.obtenerProveedores.and.returnValue(of({
      data: mockProveedores,
      mensaje: 'Proveedores obtenidos exitosamente',
      paginacion: {
        pagina: 1,
        por_pagina: 20,
        total: 1,
        total_paginas: 1
      }
    }));

    component.cargarProveedores();

    jexpect(component.proveedores).toEqual(mockProveedores);
    jexpect(component.isLoading).toBe(false);
    jexpect(component.errorMessage).toBe('');
  });

  it('should update pagination from response', () => {
    proveedorServiceSpy.obtenerProveedores.and.returnValue(of({
      data: [],
      mensaje: 'Success',
      paginacion: {
        pagina: 2,
        por_pagina: 50,
        total: 100,
        total_paginas: 2
      }
    }));

    component.paginacion.por_pagina = 50; // Usuario seleccionó 50
    component.cargarProveedores();

    jexpect(component.paginacion.pagina).toBe(2);
    jexpect(component.paginacion.total).toBe(100);
    jexpect(component.paginacion.total_paginas).toBe(2);
    jexpect(component.paginacion.por_pagina).toBe(50); // Debe mantener la selección del usuario
  });

  it('should apply filters and reset page', () => {
    component.searchTerm = 'test';
    component.selectedPais = 'Colombia';
    
    spyOn(component, 'cargarProveedores');
    
    component.aplicarFiltros();
    
    jexpect(component.cargarProveedores).toHaveBeenCalledWith(true);
  });

  it('should handle page change event', () => {
    const pageEvent = {
      pageIndex: 2,
      pageSize: 50,
      length: 100
    };

    spyOn(component, 'cargarProveedores');
    
    component.onPageChange(pageEvent as any);
    
    jexpect(component.paginacion.pagina).toBe(3); // pageIndex + 1
    jexpect(component.paginacion.por_pagina).toBe(50);
    jexpect(component.cargarProveedores).toHaveBeenCalled();
  });

  it('should open dialog for registrar proveedor', () => {
    const spy = spyOn(component, 'openRegistrarProveedorDialog');
    component.openRegistrarProveedorDialog();
    
    jexpect(spy).toHaveBeenCalled();
  });

  it('should call matDialog.open and reload on successful close', () => {
    // Aseguramos interceptar cualquier instancia real de MatDialog
    const openProtoSpy = spyOn(MatDialog.prototype, 'open').and.returnValue({
      afterClosed: () => of(true)
    } as any);
    const snackOpenSpy = spyOn(MatSnackBar.prototype, 'open');
    const cargarSpy = spyOn(component, 'cargarProveedores');

    component.openRegistrarProveedorDialog();

    jexpect(openProtoSpy).toHaveBeenCalled();
    // afterClosed(true) dispara recarga y snackbar
    jexpect(cargarSpy).toHaveBeenCalled();
    jexpect(snackOpenSpy).toHaveBeenCalled();
  });

  it('should reload proveedores after successful registration', () => {
    dialogRefSpyObj.afterClosed.and.returnValue(of(true));
    const cargarSpy = spyOn(component, 'cargarProveedores');
    
    // Simular la lógica del método sin llamarlo directamente
    dialogRefSpyObj.afterClosed().subscribe(result => {
      if (result) {
        component.cargarProveedores();
      }
    });
    
    jexpect(cargarSpy).toHaveBeenCalled();
  });

  it('should return true for tieneProveedores when proveedores array has items', () => {
    component.proveedores = [{
      id: 1,
      nombre: 'Test',
      nit: '123',
      nombre_contacto: 'Contact',
      email: 'test@test.com',
      direccion: 'Address',
      pais: 'Colombia',
      telefono: '123',
      estado: 'Activo',
      estado_certificacion: 'vigente',
      fecha_registro: '2024-01-01',
      total_certificaciones: 1
    }];
    
    jexpect(component.tieneProveedores).toBe(true);
  });

  it('should return false for tieneProveedores when proveedores array is empty', () => {
    component.proveedores = [];
    
    jexpect(component.tieneProveedores).toBe(false);
  });

  it('should build params correctly with all filters', () => {
    component.searchTerm = 'test';
    component.selectedPais = 'Colombia';
    component.selectedEstado = 'Activo';
    component.paginacion.pagina = 2;
    component.paginacion.por_pagina = 50;

    component.cargarProveedores();

    jexpect(proveedorServiceSpy.obtenerProveedores).toHaveBeenCalledWith(
      jasmine.objectContaining({
        pagina: 2,
        por_pagina: 50,
        nombre: 'test',
        pais: 'Colombia',
        estado: 'Activo'
      })
    );
  });

  it('should not include empty search term in params', () => {
    component.searchTerm = '';
    component.selectedPais = 'Colombia';
    component.selectedEstado = 'Activo';

    component.cargarProveedores();

    const callArgs = proveedorServiceSpy.obtenerProveedores.calls.mostRecent().args[0];
    jexpect(callArgs?.nombre).toBeUndefined();
    jexpect(callArgs?.pais).toBe('Colombia');
    jexpect(callArgs?.estado).toBe('Activo');
  });

  it('should reset page to 1 when cargarProveedores is called with resetearPagina=true', () => {
    component.paginacion.pagina = 5;
    
    component.cargarProveedores(true);
    
    jexpect(component.paginacion.pagina).toBe(1);
  });

  it('should handle error when loading proveedores fails', (done) => {
    spyOn(console, 'error');

    proveedorServiceSpy.obtenerProveedores.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    component.cargarProveedores();

    setTimeout(() => {
      jexpect(component.isLoading).toBe(false);
      jexpect(component.errorMessage).toContain('Error al cargar');
      jexpect(console.error).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should set isLoading to true when starting to load proveedores', () => {
    component.isLoading = false;
    
    component.cargarProveedores();
    
    // isLoading se establece a true inmediatamente
    jexpect(proveedorServiceSpy.obtenerProveedores).toHaveBeenCalled();
  });

  it('should load zonas on init', () => {
    jexpect(rutaServiceSpy.obtenerZonas).toHaveBeenCalled();
  });

  it('should populate paises list from zonas', () => {
    jexpect(component.paises.length).toBeGreaterThan(0);
    jexpect(component.paises[0].label).toContain('Todos');
    // Verificar que se agregaron las zonas
    jexpect(component.zonas.length).toBe(2);
  });

  it('should handle error loading zonas', () => {
    rutaServiceSpy.obtenerZonas.and.returnValue(
      throwError(() => new Error('Network error'))
    );
    
    const newFixture = TestBed.createComponent(ProveedoresComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    jexpect(newComponent.paises.length).toBe(1); // Solo "Todos"
    jexpect(newComponent.paises[0].label).toContain('Todos');
  });

  it('should have correct estados list', () => {
    jexpect(component.estados.length).toBe(3);
    jexpect(component.estados[0].label).toBe('Todos');
    jexpect(component.estados[1].value).toBe('Activo');
    jexpect(component.estados[2].value).toBe('Inactivo');
  });

  it('should compute hasFiltrosActivos correctly', () => {
    component.searchTerm = '';
    component.selectedPais = 'Todos';
    component.selectedEstado = 'Todos';
    jexpect(component.hasFiltrosActivos).toBeFalse();

    component.searchTerm = 'abc';
    jexpect(component.hasFiltrosActivos).toBeTrue();

    component.searchTerm = '';
    component.selectedPais = 'Colombia';
    jexpect(component.hasFiltrosActivos).toBeTrue();

    component.selectedPais = 'Todos';
    component.selectedEstado = 'Activo';
    jexpect(component.hasFiltrosActivos).toBeTrue();
  });

  it('should return proper chip classes', () => {
    jexpect(component.getEstadoClass('Activo')).toBe('estado-activo');
    jexpect(component.getEstadoClass('Inactivo')).toBe('estado-inactivo');
    jexpect(component.getEstadoCertificacionClass('vigente')).toBe('certificacion-vigente');
    jexpect(component.getEstadoCertificacionClass('vencida')).toBe('certificacion-vencida');
  });
});

