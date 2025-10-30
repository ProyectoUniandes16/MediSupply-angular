import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PlanVentaHttpService } from './plan-venta-http.service';
import { RegistrarPlanVentaRequest, RegistrarPlanVentaResponse } from '../models/plan-venta.models';
import { environment } from '../../../environments/environment';

describe('PlanVentaHttpService', () => {
  let service: PlanVentaHttpService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl || '/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlanVentaHttpService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PlanVentaHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registrarPlanVenta', () => {
    it('should register a plan de venta successfully', () => {
      const mockRequest: RegistrarPlanVentaRequest = {
        nombre_plan: 'Plan Q1 2025',
        gerente_id: 'uuid-gerente',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025-01',
        meta_ingresos: 50000,
        meta_visitas: 100,
        meta_clientes_nuevos: 20,
        estado: 'activo'
      };

      const mockResponse: RegistrarPlanVentaResponse = {
        id: '123',
        ...mockRequest,
        fecha_creacion: '2025-01-01',
        fecha_actualizacion: '2025-01-01'
      };

      service.registrarPlanVenta(mockRequest).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/planes-venta`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRequest);
      req.flush(mockResponse);
    });

    it('should handle error when registration fails', () => {
      const mockRequest: RegistrarPlanVentaRequest = {
        nombre_plan: 'Plan Q1 2025',
        gerente_id: 'uuid-gerente',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025-01',
        meta_ingresos: 50000,
        meta_visitas: 100,
        meta_clientes_nuevos: 20,
        estado: 'activo'
      };

      const mockError = { status: 400, error: { message: 'Datos inválidos' } };

      service.registrarPlanVenta(mockRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toBe('Datos inválidos');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/planes-venta`);
      req.flush(mockError.error, { status: mockError.status, statusText: 'Bad Request' });
    });

    it('should handle 409 conflict error', () => {
      const mockRequest: RegistrarPlanVentaRequest = {
        nombre_plan: 'Plan Q1 2025',
        gerente_id: 'uuid-gerente',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025-01',
        meta_ingresos: 50000,
        meta_visitas: 100,
        meta_clientes_nuevos: 20,
        estado: 'activo'
      };

      const mockError = { status: 409, error: { error: 'Plan ya existe' } };

      service.registrarPlanVenta(mockRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/planes-venta`);
      req.flush(mockError.error, { status: mockError.status, statusText: 'Conflict' });
    });
  });

  describe('validarDatosPlanVenta', () => {
    it('should validate valid plan data', () => {
      const validData: RegistrarPlanVentaRequest = {
        nombre_plan: 'Plan Q1 2025',
        gerente_id: 'uuid-gerente',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025-01',
        meta_ingresos: 50000,
        meta_visitas: 100,
        meta_clientes_nuevos: 20,
        estado: 'activo'
      };

      const result = service.validarDatosPlanVenta(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return error for empty nombre_plan', () => {
      const invalidData: RegistrarPlanVentaRequest = {
        nombre_plan: '',
        gerente_id: 'uuid-gerente',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025-01',
        meta_ingresos: 50000,
        meta_visitas: 100,
        meta_clientes_nuevos: 20,
        estado: 'activo'
      };

      const result = service.validarDatosPlanVenta(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El nombre del plan es obligatorio');
    });

    it('should return error for empty gerente_id', () => {
      const invalidData: RegistrarPlanVentaRequest = {
        nombre_plan: 'Plan Q1 2025',
        gerente_id: '',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025-01',
        meta_ingresos: 50000,
        meta_visitas: 100,
        meta_clientes_nuevos: 20,
        estado: 'activo'
      };

      const result = service.validarDatosPlanVenta(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El gerente es obligatorio');
    });

    it('should return error for empty vendedor_id', () => {
      const invalidData: RegistrarPlanVentaRequest = {
        nombre_plan: 'Plan Q1 2025',
        gerente_id: 'uuid-gerente',
        vendedor_id: '',
        periodo: '2025-01',
        meta_ingresos: 50000,
        meta_visitas: 100,
        meta_clientes_nuevos: 20,
        estado: 'activo'
      };

      const result = service.validarDatosPlanVenta(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El vendedor es obligatorio');
    });

    it('should return error for invalid periodo format', () => {
      const invalidData: RegistrarPlanVentaRequest = {
        nombre_plan: 'Plan Q1 2025',
        gerente_id: 'uuid-gerente',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025/01',
        meta_ingresos: 50000,
        meta_visitas: 100,
        meta_clientes_nuevos: 20,
        estado: 'activo'
      };

      const result = service.validarDatosPlanVenta(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El periodo debe tener formato YYYY-MM');
    });

    it('should return error for zero meta_ingresos', () => {
      const invalidData: RegistrarPlanVentaRequest = {
        nombre_plan: 'Plan Q1 2025',
        gerente_id: 'uuid-gerente',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025-01',
        meta_ingresos: 0,
        meta_visitas: 100,
        meta_clientes_nuevos: 20,
        estado: 'activo'
      };

      const result = service.validarDatosPlanVenta(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La meta de ingresos debe ser mayor a 0');
    });

    it('should return error for zero meta_visitas', () => {
      const invalidData: RegistrarPlanVentaRequest = {
        nombre_plan: 'Plan Q1 2025',
        gerente_id: 'uuid-gerente',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025-01',
        meta_ingresos: 50000,
        meta_visitas: 0,
        meta_clientes_nuevos: 20,
        estado: 'activo'
      };

      const result = service.validarDatosPlanVenta(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La meta de visitas debe ser mayor a 0');
    });

    it('should return error for zero meta_clientes_nuevos', () => {
      const invalidData: RegistrarPlanVentaRequest = {
        nombre_plan: 'Plan Q1 2025',
        gerente_id: 'uuid-gerente',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025-01',
        meta_ingresos: 50000,
        meta_visitas: 100,
        meta_clientes_nuevos: 0,
        estado: 'activo'
      };

      const result = service.validarDatosPlanVenta(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La meta de clientes nuevos debe ser mayor a 0');
    });

    it('should return error for invalid estado', () => {
      const invalidData: RegistrarPlanVentaRequest = {
        nombre_plan: 'Plan Q1 2025',
        gerente_id: 'uuid-gerente',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025-01',
        meta_ingresos: 50000,
        meta_visitas: 100,
        meta_clientes_nuevos: 20,
        estado: 'invalido'
      };

      const result = service.validarDatosPlanVenta(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El estado debe ser activo, inactivo o pendiente');
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const invalidData: RegistrarPlanVentaRequest = {
        nombre_plan: '',
        gerente_id: '',
        vendedor_id: '',
        periodo: 'invalid',
        meta_ingresos: 0,
        meta_visitas: 0,
        meta_clientes_nuevos: 0,
        estado: 'invalid'
      };

      const result = service.validarDatosPlanVenta(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(8);
    });
  });

  describe('mapearFormularioARequest', () => {
    it('should map form values to request correctly', () => {
      const formValue = {
        nombrePlan: 'Plan Q1 2025',
        gerenteId: 'uuid-gerente',
        vendedorId: 'uuid-vendedor',
        periodo: '2025-01',
        metaIngresos: '50000',
        metaVisitas: '100',
        metaClientesNuevos: '20',
        estado: 'activo'
      };

      const result = service.mapearFormularioARequest(formValue);

      expect(result).toEqual({
        nombre_plan: 'Plan Q1 2025',
        gerente_id: 'uuid-gerente',
        vendedor_id: 'uuid-vendedor',
        periodo: '2025-01',
        meta_ingresos: 50000,
        meta_visitas: 100,
        meta_clientes_nuevos: 20,
        estado: 'activo'
      });
    });

    it('should use default gerente_id when not provided', () => {
      const formValue = {
        nombrePlan: 'Plan Q1 2025',
        vendedorId: 'uuid-vendedor',
        periodo: '2025-01',
        metaIngresos: '50000',
        metaVisitas: '100',
        metaClientesNuevos: '20',
        estado: 'activo'
      };

      const result = service.mapearFormularioARequest(formValue);

      expect(result.gerente_id).toBe('default-gerente-id');
    });

    it('should parse numeric strings correctly', () => {
      const formValue = {
        nombrePlan: 'Plan Q1 2025',
        gerenteId: 'uuid-gerente',
        vendedorId: 'uuid-vendedor',
        periodo: '2025-01',
        metaIngresos: '75000.5',
        metaVisitas: '150',
        metaClientesNuevos: '30',
        estado: 'activo'
      };

      const result = service.mapearFormularioARequest(formValue);

      expect(result.meta_ingresos).toBe(75000.5);
      expect(result.meta_visitas).toBe(150);
      expect(result.meta_clientes_nuevos).toBe(30);
      expect(typeof result.meta_ingresos).toBe('number');
      expect(typeof result.meta_visitas).toBe('number');
      expect(typeof result.meta_clientes_nuevos).toBe('number');
    });
  });
});
