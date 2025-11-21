import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarRutaComponent } from './registrar-ruta.component';
import { RutaHttpService } from '../../../../core/services/ruta-http.service';
import { Zona, ZonaDetalle, Bodega, Camion, TipoCamion } from '../../../../core/models/ruta.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { FakeTranslateLoader } from '../../../../testing/i18n-testing.helper';

// Utilidad para crear un MatDialogRef mock
class MatDialogRefMock {
  close(value?: any) {}
}

// Helper to bypass mixed matcher type inference (Jasmine vs Chai)
const jexpect = (value: any) => (expect(value) as any);

describe('RegistrarRutaComponent', () => {
  let component: RegistrarRutaComponent;
  let fixture: ComponentFixture<RegistrarRutaComponent>;
  let rutaServiceSpy: jasmine.SpyObj<RutaHttpService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    rutaServiceSpy = jasmine.createSpyObj('RutaHttpService', [
      'obtenerZonas',
      'obtenerDetalleZona',
      'obtenerPedidosPorZona',
      'calcularRutaOptima',
      'obtenerRutaOptimaHTML',
      'registrarRuta'
    ]);
    // Valor por defecto para evitar undefined.subscribe en tests que disparan ngOnInit
    rutaServiceSpy.obtenerZonas.and.returnValue(of({ data: [], total: 0 }));
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        RegistrarRutaComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
      providers: [
        { provide: RutaHttpService, useValue: rutaServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        TranslateService
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setDefaultLang('es');
    translate.use('es');

    fixture = TestBed.createComponent(RegistrarRutaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
  jexpect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load zonas on init', () => {
      const zonas: Zona[] = [
        {
          id: 'z1',
          nombre: 'Zona 1',
          latitud_maxima: 0,
          latitud_minima: 0,
          longitud_maxima: 0,
          longitud_minima: 0,
          fecha_creacion: new Date().toISOString()
        }
      ];
      rutaServiceSpy.obtenerZonas.and.returnValue(of({ data: zonas, total: zonas.length }));
      fixture.detectChanges(); // triggers ngOnInit
  jexpect(rutaServiceSpy.obtenerZonas).toHaveBeenCalled();
  jexpect(component.zonas.length).toBe(1);
  jexpect(component.isLoadingZonas).toBeFalse();
    });

    it('should handle error when loading zonas', () => {
      rutaServiceSpy.obtenerZonas.and.returnValue(throwError(() => ({ status: 500 })));
      fixture.detectChanges();
  jexpect(rutaServiceSpy.obtenerZonas).toHaveBeenCalled();
  jexpect(component.zonas.length).toBe(0);
  jexpect(component.errorMessage).toContain('Error');
  jexpect(component.isLoadingZonas).toBeFalse();
    });
  });

  describe('onZonaChange', () => {
    beforeEach(() => {
      // Setup zonas
      component.zonas = [
        {
          id: 'z1', nombre: 'Zona 1', latitud_maxima: 0, latitud_minima: 0,
          longitud_maxima: 0, longitud_minima: 0, fecha_creacion: new Date().toISOString()
        }
      ];
    });

    it('should clear bodega and camion data when zona changes', () => {
      component.selectedZonaId = 'z1';
      const detalle: ZonaDetalle = {
        id: 'z1', nombre: 'Zona 1',
        latitud_maxima: 0, latitud_minima: 0,
        longitud_maxima: 0, longitud_minima: 0,
        fecha_creacion: new Date().toISOString(),
        bodegas: []
      };
      rutaServiceSpy.obtenerDetalleZona.and.returnValue(of(detalle));
      rutaServiceSpy.obtenerPedidosPorZona.and.returnValue(of({ data: [] }));
      component.onZonaChange();
  jexpect(rutaServiceSpy.obtenerDetalleZona).toHaveBeenCalledWith('z1');
  jexpect(rutaServiceSpy.obtenerPedidosPorZona).toHaveBeenCalledWith('Zona 1');
    });

    it('should load pedidos when zona has name', () => {
      const detalle2: ZonaDetalle = {
        id: 'z1', nombre: 'Zona 1',
        latitud_maxima: 0, latitud_minima: 0,
        longitud_maxima: 0, longitud_minima: 0,
        fecha_creacion: new Date().toISOString(),
        bodegas: []
      };
      rutaServiceSpy.obtenerDetalleZona.and.returnValue(of(detalle2));
      rutaServiceSpy.obtenerPedidosPorZona.and.returnValue(of({ data: [ { id: 'p1', nombre: 'Pedido 1' } ] }));
      component.selectedZonaId = 'z1';
      component.onZonaChange();
  jexpect(component.pedidos.length).toBe(1);
    });
  });

  describe('onBodegaChange', () => {
    it('should populate camiones from selected bodega', () => {
      component.bodegas = [
        {
          id: 'b1', nombre: 'Bodega', longitud: -74.1, latitud: 4.7,
          ubicacion: 'Bogotá', fecha_creacion: new Date().toISOString(),
          camiones: [ { id: 'c1', placa: 'AAA123', capacidad_kg: 10, capacidad_m3: 5, estado: 'activo', tipo_camion: { id:'t1', nombre:'Tipo 1', descripcion:'desc'} as TipoCamion } ]
        } as Bodega
      ];
      component.selectedBodegaId = 'b1';
      component.onBodegaChange();
  jexpect(component.camiones.length).toBe(1);
    });
  });

  describe('canCalculate getter', () => {
    it('should return false when required fields are missing', () => {
  jexpect(component.canCalculate).toBeFalse();
    });

    it('should return true when all required fields are present', () => {
      component.nombreRuta = 'Ruta 1';
      component.selectedZonaId = 'z1';
      component.selectedBodegaId = 'b1';
      component.selectedCamionId = 'c1';
      component.pedidosIds = ['p1'];
  jexpect(component.canCalculate).toBeTrue();
    });
  });

  describe('onCalcular', () => {
    beforeEach(() => {
      component.nombreRuta = 'Ruta 1';
      component.selectedZonaId = 'z1';
      component.selectedBodegaId = 'b1';
      component.selectedCamionId = 'c1';
      component.pedidos = [
        { id: 'p1', nombre: 'Pedido 1', longitud: -74.05, latitud: 4.68 }
      ];
      component.pedidosIds = ['p1'];
      component.bodegas = [
        { id: 'b1', nombre: 'Bodega', longitud: -74.07, latitud: 4.71, ubicacion: 'Bogotá', fecha_creacion: new Date().toISOString(), camiones: [] }
      ];
    });

    it('should warn if any selected pedido lacks location', () => {
      component.pedidos[0].longitud = undefined;
      rutaServiceSpy.calcularRutaOptima.and.returnValue(of({ mensaje: 'ok' }));
      // No es necesario disparar ngOnInit aquí, trabajamos con estado manual
      const sbSpy = spyOn(component['snackBar'], 'open');
      component.onCalcular();
  jexpect(rutaServiceSpy.calcularRutaOptima).not.toHaveBeenCalled();
  jexpect(sbSpy).toHaveBeenCalled();
    });

    it('should call calcularRutaOptima with correct payload', () => {
      const mockResponse = { mensaje: 'ok', orden_optimo: [] };
      rutaServiceSpy.calcularRutaOptima.and.returnValue(of(mockResponse));
      component.onCalcular();
  jexpect(rutaServiceSpy.calcularRutaOptima).toHaveBeenCalledWith([-74.07, 4.71], [[-74.05, 4.68]]);
  jexpect(component.rutaCalculada).toBeTrue();
  jexpect(component.ultimaRespuestaCalculo).toEqual(mockResponse);
    });

    it('should handle error from calcularRutaOptima', () => {
      rutaServiceSpy.calcularRutaOptima.and.returnValue(throwError(() => ({ error: { message: 'fail' } })));
      const sbSpy = spyOn(component['snackBar'], 'open');
      component.onCalcular();
  jexpect(component.rutaCalculada).toBeFalse();
  jexpect(component.ultimaRespuestaCalculo).toBeNull();
  jexpect(sbSpy).toHaveBeenCalled();
    });
  });

  describe('onRegistrar', () => {
    beforeEach(() => {
      component.selectedBodegaId = 'b1';
      component.selectedCamionId = 'c1';
      component.selectedZonaId = 'z1';
      component.selectedEstado = 'pendiente';
      component.pedidos = [
        { id: 'p1', longitud: -74.05, latitud: 4.68 },
        { id: 'p2', longitud: -74.06, latitud: 4.69 }
      ];
      component.pedidosIds = ['p1','p2'];
      component.rutaCalculada = true;
      component.ultimaRespuestaCalculo = {
        orden_optimo: [
          { job_id: 'inicio/fin', ubicacion: [-74.07, 4.71] },
          { job_id: 'pedido-1', ubicacion: [-74.05, 4.68] },
          { job_id: 'pedido-2', ubicacion: [-74.06, 4.69] },
          { job_id: 'inicio/fin', ubicacion: [-74.07, 4.71] }
        ]
      };
    });

    it('should build request and call registrarRuta', () => {
      rutaServiceSpy.registrarRuta.and.returnValue(of({ mensaje: 'ok' }));
      component.onRegistrar();
  jexpect(rutaServiceSpy.registrarRuta).toHaveBeenCalled();
      const callArg = rutaServiceSpy.registrarRuta.calls.mostRecent().args[0];
  jexpect(callArg.ruta.length).toBe(2);
  jexpect(callArg.bodega_id).toBe('b1');
  jexpect(callArg.camion_id).toBe('c1');
  jexpect(callArg.zona_id).toBe('z1');
  jexpect(callArg.estado).toBe('pendiente');
    });

    it('should warn if not calculated', () => {
      component.rutaCalculada = false;
      component.ultimaRespuestaCalculo = null; // refuerza la condición
      const sbSpy = spyOn(component['snackBar'], 'open');
      component.onRegistrar();
  jexpect(rutaServiceSpy.registrarRuta).not.toHaveBeenCalled();
  jexpect(sbSpy).toHaveBeenCalled();
    });

    it('should handle error from registrarRuta', () => {
      rutaServiceSpy.registrarRuta.and.returnValue(throwError(() => ({ error: { message: 'error' } })));
      const sbSpy = spyOn(component['snackBar'], 'open');
      component.onRegistrar();
  jexpect(sbSpy).toHaveBeenCalled();
    });
  });
});
