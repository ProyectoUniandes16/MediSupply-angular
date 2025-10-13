import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  RegistrarProveedorRequest,
  RegistrarProveedorResponse,
  Proveedor
} from '../models/proveedor.models';

/**
 * Servicio HTTP para la gestión de proveedores
 * Maneja las llamadas HTTP al backend para operaciones CRUD de proveedores
 */
@Injectable({
  providedIn: 'root'
})
export class ProveedorHttpService {
  private readonly apiUrl = environment.apiUrl || '/api';

  constructor(private readonly http: HttpClient) {}

  /**
   * Registra un nuevo proveedor con certificaciones
   * 
   * @param data - Datos del proveedor a registrar
   * @returns Observable con la respuesta del servidor
   * 
   * Endpoint: POST /api/proveedores/
   * Content-Type: multipart/form-data
   * 
   * @example
   * const request: RegistrarProveedorRequest = {
   *   nombre: 'Proveedor ABC',
   *   nit: '900123456',
   *   pais: 'Colombia',
   *   direccion: 'Calle 123 #45-67',
   *   nombre_contacto: 'Juan Pérez',
   *   email: 'contacto@proveedor.com',
   *   telefono: '3001234567',
   *   certificaciones: [file1, file2]
   * };
   * 
   * this.proveedorHttpService.registrarProveedor(request).subscribe({
   *   next: (response) => console.log('Proveedor registrado:', response),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  registrarProveedor(data: RegistrarProveedorRequest): Observable<RegistrarProveedorResponse> {
    const formData = new FormData();

    // Agregar campos de texto al FormData
    formData.append('nombre', data.nombre);
    formData.append('nit', data.nit);
    formData.append('pais', data.pais);
    formData.append('direccion', data.direccion);
    formData.append('nombre_contacto', data.nombre_contacto);
    formData.append('email', data.email);
    formData.append('telefono', data.telefono);

    // Agregar archivos de certificaciones al FormData
    if (data.certificaciones && data.certificaciones.length > 0) {
      data.certificaciones.forEach((file) => {
        formData.append('certificaciones', file, file.name);
      });
    }

    // No establecer Content-Type manualmente para multipart/form-data
    // El navegador lo establece automáticamente con el boundary correcto
    return this.http.post<RegistrarProveedorResponse>(
      `${this.apiUrl}/proveedor`,
      formData
    ).pipe(
      catchError(error => {
        console.error('Error al registrar proveedor:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene la lista de todos los proveedores
   * 
   * @returns Observable con el array de proveedores
   */
  obtenerProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/proveedor/`).pipe(
      catchError(error => {
        console.error('Error al obtener proveedores:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un proveedor por su ID
   * 
   * @param id - ID del proveedor
   * @returns Observable con los datos del proveedor
   */
  obtenerProveedorPorId(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/proveedor/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener proveedor ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza un proveedor existente
   * 
   * @param id - ID del proveedor a actualizar
   * @param data - Datos actualizados del proveedor
   * @returns Observable con la respuesta del servidor
   */
  actualizarProveedor(id: number, data: Partial<RegistrarProveedorRequest>): Observable<RegistrarProveedorResponse> {
    const formData = new FormData();

    // Agregar solo los campos que se están actualizando
    if (data.nombre) formData.append('nombre', data.nombre);
    if (data.nit) formData.append('nit', data.nit);
    if (data.pais) formData.append('pais', data.pais);
    if (data.direccion) formData.append('direccion', data.direccion);
    if (data.nombre_contacto) formData.append('nombre_contacto', data.nombre_contacto);
    if (data.email) formData.append('email', data.email);
    if (data.telefono) formData.append('telefono', data.telefono);

    // Agregar archivos de certificaciones si existen
    if (data.certificaciones && data.certificaciones.length > 0) {
      data.certificaciones.forEach((file) => {
        formData.append('certificaciones', file, file.name);
      });
    }

    return this.http.put<RegistrarProveedorResponse>(
      `${this.apiUrl}/proveedor/${id}`,
      formData
    ).pipe(
      catchError(error => {
        console.error(`Error al actualizar proveedor ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un proveedor
   * 
   * @param id - ID del proveedor a eliminar
   * @returns Observable con la respuesta del servidor
   */
  eliminarProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/proveedor/${id}`).pipe(
      catchError(error => {
        console.error(`Error al eliminar proveedor ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Valida los datos de un proveedor antes de registrarlo
   * Esta es una validación del lado del cliente
   * 
   * @param data - Datos del proveedor a validar
   * @returns Objeto con el resultado de la validación y errores si existen
   */
  validarDatosProveedor(data: RegistrarProveedorRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre
    if (!data.nombre || data.nombre.trim().length === 0) {
      errors.push('El nombre del proveedor es obligatorio');
    }

    // Validar NIT (9-10 dígitos)
    if (!data.nit || !/^\d{9,10}$/.test(data.nit.replace(/-/g, ''))) {
      errors.push('El NIT debe tener entre 9 y 10 dígitos');
    }

    // Validar país
    if (!data.pais || data.pais.trim().length === 0) {
      errors.push('El país es obligatorio');
    }

    // Validar dirección
    if (!data.direccion || data.direccion.trim().length === 0) {
      errors.push('La dirección es obligatoria');
    }

    // Validar nombre de contacto
    if (!data.nombre_contacto || data.nombre_contacto.trim().length === 0) {
      errors.push('El nombre del contacto es obligatorio');
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

    // Validar certificaciones
    if (!data.certificaciones || data.certificaciones.length === 0) {
      errors.push('Debe adjuntar al menos una certificación');
    } else {
      // Validar tamaño y tipo de archivos
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

      data.certificaciones.forEach((file) => {
        if (file.size > maxSize) {
          errors.push(`El archivo "${file.name}" excede el tamaño máximo de 5MB`);
        }
        if (!allowedTypes.includes(file.type)) {
          errors.push(`El archivo "${file.name}" no es un formato válido (PDF, JPG, PNG)`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Mapea los datos del formulario del componente a la estructura del API
   * Convierte nombreProveedor -> nombre, nombreContacto -> nombre_contacto, etc.
   * 
   * @param formValue - Valores del formulario
   * @param certificaciones - Array de archivos
   * @returns Request formateado para el API
   */
  mapearFormularioARequest(formValue: any, certificaciones: File[]): RegistrarProveedorRequest {
    return {
      nombre: formValue.nombreProveedor,
      nit: formValue.nit,
      pais: formValue.pais,
      direccion: formValue.direccion,
      nombre_contacto: formValue.nombreContacto,
      email: formValue.email,
      telefono: formValue.telefono,
      certificaciones: certificaciones
    };
  }
}
