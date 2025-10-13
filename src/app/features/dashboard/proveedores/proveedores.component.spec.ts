import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedoresComponent } from './proveedores.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('ProveedoresComponent', () => {
  let component: ProveedoresComponent;
  let fixture: ComponentFixture<ProveedoresComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let dialogRefSpyObj: jasmine.SpyObj<MatDialogRef<any>>;

  beforeEach(async () => {
    dialogRefSpyObj = jasmine.createSpyObj({
      afterClosed: of(null),
      close: null
    });
    
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    matDialogSpy.open.and.returnValue(dialogRefSpyObj);

    await TestBed.configureTestingModule({
      imports: [ProveedoresComponent],
      providers: [
        { provide: MatDialog, useValue: matDialogSpy },
        provideAnimations(),
        provideHttpClient()
      ]
    }).compileComponents();

    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
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
    expect(component.displayedColumns).toEqual(['nombre', 'nit', 'contacto', 'email', 'acciones']);
  });

  it('should clear search term', () => {
    component.searchTerm = 'test';
    
    component.limpiarBusqueda();
    
    expect(component.searchTerm).toBe('');
  });

  it('should call editarProveedor with correct proveedor', () => {
    spyOn(console, 'log');
    const testProveedor = {
      nombre: 'Test Proveedor',
      nit: '123456789',
      contacto: 'Test Contacto',
      email: 'test@test.com'
    };

    component.editarProveedor(testProveedor);

    expect(console.log).toHaveBeenCalledWith('Editar proveedor:', testProveedor);
  });

  it('should initialize with empty selectedEstado', () => {
    expect(component.selectedEstado).toBe('');
  });

  it('should initialize with empty searchTerm', () => {
    expect(component.searchTerm).toBe('');
  });
});
