import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  RegistrarVendedorRequest,
  RegistrarVendedorResponse,
  Vendedor,
  ObtenerVendedoresResponse,
  ReporteVentasVendedor
} from '../models/vendedor.models';

/**
 * Servicio HTTP para la gestión de vendedores
 * Maneja las llamadas HTTP al backend para operaciones CRUD de vendedores
 */
@Injectable({
  providedIn: 'root'
})
export class VendedorHttpService {
  private readonly apiUrl = environment.apiUrl || '/api';

  constructor(private readonly http: HttpClient) {}

  /**
   * Registra un nuevo vendedor
   * 
   * @param data - Datos del vendedor a registrar
   * @returns Observable con la respuesta del servidor
   * 
   * Endpoint: POST /api/vendedores/
   * Content-Type: application/json
   * 
   * @example
   * const request: RegistrarVendedorRequest = {
   *   nombres: 'Juan',
   *   apellidos: 'Pérez',
   *   zona: 'Colombia',
   *   estado: 'Activo',
   *   telefono: '3001234567',
   *   email: 'juan.perez@example.com'
   * };
   * 
   * this.vendedorHttpService.registrarVendedor(request).subscribe({
   *   next: (response) => console.log('Vendedor registrado:', response),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  registrarVendedor(data: RegistrarVendedorRequest): Observable<RegistrarVendedorResponse> {
    return this.http.post<RegistrarVendedorResponse>(
      `${this.apiUrl}/vendedor`,
      data
    ).pipe(
      catchError(error => {
        console.error('Error al registrar vendedor:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene la lista de vendedores con paginación y filtros
   * 
   * @param params - Parámetros de paginación y filtros
   * @returns Observable con la respuesta paginada de vendedores
   * 
   * Endpoint: GET /api/vendedor
   * 
   * @example
   * const params = {
   *   page: 1,
   *   size: 10,
   *   nombre: 'Juan',
   *   zona: 'Colombia',
   *   estado: 'Activo'
   * };
   * 
   * this.vendedorHttpService.obtenerVendedores(params).subscribe({
   *   next: (response) => console.log('Vendedores:', response),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  obtenerVendedores(params?: any): Observable<ObtenerVendedoresResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      for (const key of Object.keys(params)) {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      }
    }

    return this.http.get<ObtenerVendedoresResponse>(`${this.apiUrl}/vendedor`, {
      params: httpParams
    }).pipe(
      catchError(error => {
        console.error('Error al obtener vendedores:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un vendedor por su ID
   * 
   * @param id - ID del vendedor (UUID)
   * @returns Observable con los datos del vendedor
   * 
   * Endpoint: GET /api/vendedor/{id}
   * 
   * @example
   * this.vendedorHttpService.obtenerVendedorPorId('993987b4-6a58-45da-a216-4c2da0a03978').subscribe({
   *   next: (vendedor) => console.log('Vendedor:', vendedor),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  obtenerVendedorPorId(id: string): Observable<Vendedor> {
    return this.http.get<{ data: Vendedor }>(`${this.apiUrl}/vendedor/${id}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error(`Error al obtener vendedor ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza un vendedor existente
   * 
   * @param id - ID del vendedor a actualizar
   * @param data - Datos actualizados del vendedor
   * @returns Observable con la respuesta del servidor
   */
  actualizarVendedor(id: number, data: Partial<RegistrarVendedorRequest>): Observable<RegistrarVendedorResponse> {
    return this.http.put<RegistrarVendedorResponse>(
      `${this.apiUrl}/vendedor/${id}`,
      data
    ).pipe(
      catchError(error => {
        console.error(`Error al actualizar vendedor ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un vendedor
   * 
   * @param id - ID del vendedor a eliminar
   * @returns Observable con la respuesta del servidor
   */
  eliminarVendedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vendedor/${id}`).pipe(
      catchError(error => {
        console.error(`Error al eliminar vendedor ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Valida los datos de un vendedor antes de registrarlo
   * Esta es una validación del lado del cliente
   * 
   * @param data - Datos del vendedor a validar
   * @returns Objeto con el resultado de la validación y errores si existen
   */
  validarDatosVendedor(data: RegistrarVendedorRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombres
    if (!data.nombre || data.nombre.trim().length === 0) {
      errors.push('Los nombres del vendedor son obligatorios');
    }

    // Validar apellidos
    if (!data.apellidos || data.apellidos.trim().length === 0) {
      errors.push('Los apellidos del vendedor son obligatorios');
    }

    // Validar zona
    if (!data.zona || data.zona.trim().length === 0) {
      errors.push('La zona es obligatoria');
    }

    // Validar estado
    if (!data.estado || data.estado.trim().length === 0) {
      errors.push('El estado es obligatorio');
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.correo || !emailRegex.test(data.correo)) {
      errors.push('El email no es válido');
    }

    // Validar teléfono (mínimo 7 dígitos)
    const telefonoDigits = data.telefono?.replaceAll(/\D/g, '');
    if (!telefonoDigits || telefonoDigits.length < 7) {
      errors.push('El teléfono debe tener al menos 7 dígitos');
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
  mapearFormularioARequest(formValue: any): RegistrarVendedorRequest {
    return {
      nombre: formValue.nombres,
      apellidos: formValue.apellidos,
      zona: formValue.zona,
      estado: formValue.estado,
      telefono: formValue.telefono,
      correo: formValue.email
    };
  }

  /**
   * Obtiene el reporte de ventas de un vendedor
   * 
   * @param vendedorId - ID del vendedor (UUID)
   * @param mes - Mes del reporte (1-12)
   * @param anio - Año del reporte
   * @returns Observable con el reporte de ventas
   * 
   * Endpoint: GET /api/vendedor/{id}/reporte-ventas?mes={mes}&anio={anio}&formato=json
   * 
   * @example
   * this.vendedorHttpService.obtenerReporteVentas('993987b4-6a58-45da-a216-4c2da0a03978', 11, 2024).subscribe({
   *   next: (reporte) => console.log('Reporte:', reporte),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  obtenerReporteVentas(vendedorId: string, mes: number, anio: number): Observable<ReporteVentasVendedor> {
    const params = new HttpParams()
      .set('mes', mes.toString())
      .set('anio', anio.toString())
      .set('formato', 'json');

    return this.http.get<ReporteVentasVendedor>(`${this.apiUrl}/vendedor/${vendedorId}/reporte-ventas`, {
      params
    }).pipe(
      catchError(error => {
        console.error(`Error al obtener reporte de ventas del vendedor ${vendedorId}:`, error);
        return throwError(() => error);
      })
    );
  }
}
