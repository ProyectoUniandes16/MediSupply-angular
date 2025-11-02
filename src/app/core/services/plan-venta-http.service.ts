import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  RegistrarPlanVentaRequest,
  RegistrarPlanVentaResponse,
  ObtenerPlanesVentaParams,
  ObtenerPlanesVentaResponse
} from '../models/plan-venta.models';

/**
 * Servicio HTTP para la gestión de planes de venta
 * Maneja las llamadas HTTP al backend para operaciones de planes de venta
 */
@Injectable({
  providedIn: 'root'
})
export class PlanVentaHttpService {
  private readonly apiUrl = environment.apiUrl || '/api';

  constructor(private readonly http: HttpClient) {}

  /**
   * Registra un nuevo plan de venta
   * 
   * @param data - Datos del plan de venta a registrar
   * @returns Observable con la respuesta del servidor
   * 
   * Endpoint: POST /api/planes-venta
   * Content-Type: application/json
   * 
   * @example
   * const request: RegistrarPlanVentaRequest = {
   *   nombre_plan: 'Plan Q1 2025',
   *   gerente_id: 'uuid-gerente',
   *   vendedores_ids: ['uuid-vendedor-1', 'uuid-vendedor-2'],
   *   periodo: '2025-01',
   *   meta_ingresos: 50000.00,
   *   meta_visitas: 100,
   *   meta_clientes_nuevos: 20,
   *   estado: 'activo',
   *   plan_id: 'uuid-plan-opcional'
   * };
   * 
   * this.planVentaHttpService.registrarPlanVenta(request).subscribe({
   *   next: (response) => console.log('Plan registrado:', response),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  registrarPlanVenta(data: RegistrarPlanVentaRequest): Observable<RegistrarPlanVentaResponse> {
    return this.http.post<RegistrarPlanVentaResponse>(
      `${this.apiUrl}/planes-venta`,
      data
    ).pipe(
      catchError(error => {
        console.error('Error al registrar plan de venta:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene una lista paginada de planes de venta
   * 
   * @param params - Parámetros de filtrado y paginación
   * @returns Observable con la respuesta paginada del servidor
   * 
   * Endpoint: GET /api/planes-venta
   * Query params: page, size, vendedor_id, nombre_plan, estado
   * 
   * @example
   * this.planVentaHttpService.obtenerPlanesVenta({ 
   *   page: 1, 
   *   size: 10,
   *   estado: 'activo'
   * }).subscribe({
   *   next: (response) => console.log('Planes:', response.items),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  obtenerPlanesVenta(params: ObtenerPlanesVentaParams = {}): Observable<ObtenerPlanesVentaResponse> {
    let httpParams = new HttpParams();

    // Agregar parámetros de paginación
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    // Agregar filtros
    if (params.vendedor_id) {
      httpParams = httpParams.set('vendedor_id', params.vendedor_id);
    }
    if (params.nombre_plan && params.nombre_plan.trim().length > 0) {
      httpParams = httpParams.set('nombre_plan', params.nombre_plan.trim());
    }
    if (params.estado) {
      httpParams = httpParams.set('estado', params.estado);
    }

    return this.http.get<ObtenerPlanesVentaResponse>(
      `${this.apiUrl}/planes-venta`,
      { params: httpParams }
    ).pipe(
      catchError(error => {
        console.error('Error al obtener planes de venta:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Valida los datos de un plan de venta antes de registrarlo
   * Esta es una validación del lado del cliente
   * 
   * @param data - Datos del plan de venta a validar
   * @returns Objeto con el resultado de la validación y errores si existen
   */
  validarDatosPlanVenta(data: RegistrarPlanVentaRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre del plan
    if (!data.nombre_plan || data.nombre_plan.trim().length === 0) {
      errors.push('El nombre del plan es obligatorio');
    }

    // Validar gerente_id
    if (!data.gerente_id || data.gerente_id.trim().length === 0) {
      errors.push('El gerente es obligatorio');
    }

    // Validar vendedores_ids
    if (!data.vendedores_ids || !Array.isArray(data.vendedores_ids) || data.vendedores_ids.length === 0) {
      errors.push('Debe seleccionar al menos un vendedor');
    }

    // Validar periodo
    const periodoRegex = /^\d{4}-\d{2}$/;
    if (!data.periodo || !periodoRegex.test(data.periodo)) {
      errors.push('El periodo debe tener formato YYYY-MM');
    }

    // Validar meta_ingresos
    if (!data.meta_ingresos || data.meta_ingresos <= 0) {
      errors.push('La meta de ingresos debe ser mayor a 0');
    }

    // Validar meta_visitas
    if (!data.meta_visitas || data.meta_visitas <= 0) {
      errors.push('La meta de visitas debe ser mayor a 0');
    }

    // Validar meta_clientes_nuevos
    if (!data.meta_clientes_nuevos || data.meta_clientes_nuevos <= 0) {
      errors.push('La meta de clientes nuevos debe ser mayor a 0');
    }

    // Validar estado
    const estadosValidos = ['activo', 'inactivo', 'pendiente'];
    if (!data.estado || !estadosValidos.includes(data.estado.toLowerCase())) {
      errors.push('El estado debe ser activo, inactivo o pendiente');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Mapea los datos del formulario del componente a la estructura del API
   * 
   * @param formValue - Valores del formulario
   * @returns Request formateado para el API
   */
  mapearFormularioARequest(formValue: any): RegistrarPlanVentaRequest {
    return {
      nombre_plan: formValue.nombrePlan,
      gerente_id: formValue.gerenteId || 'default-gerente-id', // Por ahora usamos un ID por defecto
      vendedores_ids: formValue.vendedoresIds || [],
      periodo: formValue.periodo,
      meta_ingresos: Number.parseFloat(formValue.metaIngresos),
      meta_visitas: Number.parseInt(formValue.metaVisitas, 10),
      meta_clientes_nuevos: Number.parseInt(formValue.metaClientesNuevos, 10),
      estado: formValue.estado,
      plan_id: formValue.planId
    };
  }
}
