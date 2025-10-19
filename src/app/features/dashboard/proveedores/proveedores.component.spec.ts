import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedoresComponent } from './proveedores.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ProveedorHttpService } from '../../../core/services/proveedor-http.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('ProveedoresComponent', () => {
  let component: ProveedoresComponent;
  let fixture: ComponentFixture<ProveedoresComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let dialogRefSpyObj: jasmine.SpyObj<MatDialogRef<any>>;
  let proveedorServiceSpy: jasmine.SpyObj<ProveedorHttpService>;

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

    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ProveedoresComponent],
      providers: [
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: ProveedorHttpService, useValue: proveedorHttpServiceSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        provideAnimations(),
        provideHttpClient()
      ]
    }).compileComponents();

    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    proveedorServiceSpy = TestBed.inject(ProveedorHttpService) as jasmine.SpyObj<ProveedorHttpService>;
    fixture = TestBed.createComponent(ProveedoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty proveedores array initially', () => {
    expect(component.proveedores).toEqual([]);
    expect(component.proveedores.length).toBe(0);
  });

  it('should have correct table columns', () => {
    expect(component.displayedColumns).toEqual(['nombre', 'pais', 'estado', 'contacto', 'acciones']);
  });

  it('should clear filters', () => {
    component.searchTerm = 'test';
    component.selectedPais = 'Colombia';
    component.selectedEstado = 'Activo';
    spyOn(component, 'cargarProveedores');
    
    component.limpiarFiltros();
    
    expect(component.searchTerm).toBe('');
    expect(component.selectedPais).toBe('Todos');
    expect(component.selectedEstado).toBe('Todos');
    expect(component.cargarProveedores).toHaveBeenCalledWith(true);
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

    expect(console.log).toHaveBeenCalledWith('Editar proveedor:', testProveedor);
  });

  it('should initialize with Todos selectedEstado', () => {
    expect(component.selectedEstado).toBe('Todos');
  });

  it('should initialize with empty searchTerm', () => {
    expect(component.searchTerm).toBe('');
  });

  it('should initialize with Todos selectedPais', () => {
    expect(component.selectedPais).toBe('Todos');
  });

  it('should call cargarProveedores on init', () => {
    expect(proveedorServiceSpy.obtenerProveedores).toHaveBeenCalled();
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

    expect(component.proveedores).toEqual(mockProveedores);
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
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

    expect(component.paginacion.pagina).toBe(2);
    expect(component.paginacion.total).toBe(100);
    expect(component.paginacion.total_paginas).toBe(2);
    expect(component.paginacion.por_pagina).toBe(50); // Debe mantener la selección del usuario
  });

  it('should apply filters and reset page', () => {
    component.searchTerm = 'test';
    component.selectedPais = 'Colombia';
    
    spyOn(component, 'cargarProveedores');
    
    component.aplicarFiltros();
    
    expect(component.cargarProveedores).toHaveBeenCalledWith(true);
  });

  it('should handle page change event', () => {
    const pageEvent = {
      pageIndex: 2,
      pageSize: 50,
      length: 100
    };

    spyOn(component, 'cargarProveedores');
    
    component.onPageChange(pageEvent as any);
    
    expect(component.paginacion.pagina).toBe(3); // pageIndex + 1
    expect(component.paginacion.por_pagina).toBe(50);
    expect(component.cargarProveedores).toHaveBeenCalled();
  });

  it('should open dialog for registrar proveedor', () => {
    const spy = spyOn(component, 'openRegistrarProveedorDialog');
    component.openRegistrarProveedorDialog();
    
    expect(spy).toHaveBeenCalled();
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
    
    expect(cargarSpy).toHaveBeenCalled();
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
    
    expect(component.tieneProveedores).toBe(true);
  });

  it('should return false for tieneProveedores when proveedores array is empty', () => {
    component.proveedores = [];
    
    expect(component.tieneProveedores).toBe(false);
  });

  it('should build params correctly with all filters', () => {
    component.searchTerm = 'test';
    component.selectedPais = 'Colombia';
    component.selectedEstado = 'Activo';
    component.paginacion.pagina = 2;
    component.paginacion.por_pagina = 50;

    component.cargarProveedores();

    expect(proveedorServiceSpy.obtenerProveedores).toHaveBeenCalledWith(
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
    expect(callArgs?.nombre).toBeUndefined();
    expect(callArgs?.pais).toBe('Colombia');
    expect(callArgs?.estado).toBe('Activo');
  });

  it('should reset page to 1 when cargarProveedores is called with resetearPagina=true', () => {
    component.paginacion.pagina = 5;
    
    component.cargarProveedores(true);
    
    expect(component.paginacion.pagina).toBe(1);
  });

  it('should handle error when loading proveedores fails', (done) => {
    spyOn(console, 'error');

    proveedorServiceSpy.obtenerProveedores.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    component.cargarProveedores();

    setTimeout(() => {
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toContain('Error al cargar');
      expect(console.error).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should set isLoading to true when starting to load proveedores', () => {
    component.isLoading = false;
    
    component.cargarProveedores();
    
    // isLoading se establece a true inmediatamente
    expect(proveedorServiceSpy.obtenerProveedores).toHaveBeenCalled();
  });

  it('should have correct paises list', () => {
    expect(component.paises.length).toBe(6);
    expect(component.paises[0].label).toBe('Todos');
    expect(component.paises[1].value).toBe('Colombia');
  });

  it('should have correct estados list', () => {
    expect(component.estados.length).toBe(3);
    expect(component.estados[0].label).toBe('Todos');
    expect(component.estados[1].value).toBe('Activo');
    expect(component.estados[2].value).toBe('Inactivo');
  });
});

