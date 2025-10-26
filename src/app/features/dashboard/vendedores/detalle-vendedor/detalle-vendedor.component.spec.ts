import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../../testing/i18n-testing.helper';
import { DetalleVendedorComponent } from './detalle-vendedor.component';
import { VendedorHttpService } from '../../../../core/services/vendedor-http.service';
import { Vendedor } from '../../../../core/models/vendedor.models';

describe('DetalleVendedorComponent', () => {
  const vendedorMock: Vendedor = {
    id: '11111111-2222-3333-4444-555555555555',
    nombre: 'Juan',
    apellidos: 'Pérez',
    correo: 'juan@example.com',
    telefono: '3001234567',
    zona: 'Colombia',
    estado: 'Activo',
    fechaCreacion: '2024-01-01T10:00:00Z',
    fechaActualizacion: '2024-01-02T12:00:00Z',
    usuarioCreacion: 'admin',
    usuarioActualizacion: 'editor'
  };

  let obtenerVendedorPorIdSpy: jasmine.Spy;
  let dialogRefSpy: { close: jasmine.Spy };

  beforeEach(async () => {
    dialogRefSpy = { close: jasmine.createSpy('close') };

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: FakeTranslateLoader } }),
        DetalleVendedorComponent
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { vendedorId: vendedorMock.id } },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: VendedorHttpService,
          useValue: {
            obtenerVendedorPorId: (id: string) => of(vendedorMock)
          }
        }
      ]
    }).compileComponents();

    const service = TestBed.inject(VendedorHttpService);
    obtenerVendedorPorIdSpy = spyOn(service, 'obtenerVendedorPorId').and.callThrough();
  });

  it('should create and load vendedor data on init', fakeAsync(() => {
    const fixture = TestBed.createComponent(DetalleVendedorComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges(); // triggers ngOnInit
    tick();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(obtenerVendedorPorIdSpy).toHaveBeenCalledWith(vendedorMock.id);
    expect(component.vendedor).toEqual(vendedorMock);
    expect(component.isLoading).toBeFalse();

    // Sanity check: template renders some values
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Juan');
    expect(compiled.textContent).toContain('Pérez');
    expect(compiled.textContent).toContain('Colombia');
  }));

  it('should handle error state and allow retry', fakeAsync(() => {
    // First call fails, second call succeeds
    obtenerVendedorPorIdSpy.and.returnValues(
      throwError(() => ({ status: 500 })),
      of(vendedorMock)
    );

    const fixture = TestBed.createComponent(DetalleVendedorComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.errorMessage).toBeTruthy();
    expect(component.isLoading).toBeFalse();

    // Retry
    component.cargarDetalleVendedor();
    tick();
    fixture.detectChanges();

    expect(component.vendedor).toEqual(vendedorMock);
    expect(component.errorMessage).toBe('');
  }));

  it('should close dialog when cerrar() is called', () => {
    const fixture = TestBed.createComponent(DetalleVendedorComponent);
    const component = fixture.componentInstance;

    component.cerrar();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should compute estado class correctly', () => {
    const fixture = TestBed.createComponent(DetalleVendedorComponent);
    const component = fixture.componentInstance;

    expect(component.getEstadoClass('Activo')).toBe('estado-activo');
    expect(component.getEstadoClass('Inactivo')).toBe('estado-inactivo');
  });

  it('should format date', () => {
    const fixture = TestBed.createComponent(DetalleVendedorComponent);
    const component = fixture.componentInstance;

    expect(component.formatearFecha('')).toBe('-');
    const formatted = component.formatearFecha('2024-01-01T10:00:00Z');
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/); // dd/mm/yyyy (es-ES)
  });
});
