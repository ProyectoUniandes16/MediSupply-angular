import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  RegistrarVendedorRequest,
  RegistrarVendedorResponse,
  Vendedor
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
   * Obtiene la lista de todos los vendedores
   * 
   * @returns Observable con el array de vendedores
   */
  obtenerVendedores(): Observable<Vendedor[]> {
    return this.http.get<Vendedor[]>(`${this.apiUrl}/vendedor/`).pipe(
      catchError(error => {
        console.error('Error al obtener vendedores:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un vendedor por su ID
   * 
   * @param id - ID del vendedor
   * @returns Observable con los datos del vendedor
   */
  obtenerVendedorPorId(id: number): Observable<Vendedor> {
    return this.http.get<Vendedor>(`${this.apiUrl}/vendedor/${id}`).pipe(
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
    if (!data.nombres || data.nombres.trim().length === 0) {
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

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push('El email no es válido');
    }

    // Validar teléfono (mínimo 7 dígitos)
    const telefonoDigits = data.telefono?.replace(/\D/g, '');
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
      nombres: formValue.nombres,
      apellidos: formValue.apellidos,
      zona: formValue.zona,
      estado: formValue.estado,
      telefono: formValue.telefono,
      email: formValue.email
    };
  }
}
