import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  RegistrarProductoRequest,
  RegistrarProductoResponse
} from '../models/producto.models';

/**
 * Servicio HTTP para la gestión de productos
 * Maneja las llamadas HTTP al backend para operaciones CRUD de productos
 */
@Injectable({
  providedIn: 'root'
})
export class ProductoHttpService {
  private readonly apiUrl = environment.apiUrl || '/api';

  constructor(private readonly http: HttpClient) {}

  /**
   * Registra un nuevo producto con certificaciones
   * 
   * @param data - Datos del producto a registrar
   * @returns Observable con la respuesta del servidor
   * 
   * Endpoint: POST /api/productos/
   * Content-Type: multipart/form-data
   */
  registrarProducto(data: RegistrarProductoRequest): Observable<RegistrarProductoResponse> {
    const formData = new FormData();

    // Agregar campos de texto al FormData
    formData.append('nombre', data.nombre);
    formData.append('codigo_sku', data.codigo_sku);
    formData.append('categoria', data.categoria);
    formData.append('precio_unitario', data.precio_unitario.toString());
    formData.append('condiciones_almacenamiento', data.condiciones_almacenamiento);
    formData.append('fecha_vencimiento', data.fecha_vencimiento);
    formData.append('bodega', data.bodega);
    formData.append('lote', data.lote);

    // Agregar archivos de certificaciones al FormData
    if (data.certificaciones && data.certificaciones.length > 0) {
      data.certificaciones.forEach((file) => {
        formData.append('certificaciones', file, file.name);
      });
    }

    return this.http.post<RegistrarProductoResponse>(
      `${this.apiUrl}/producto`,
      formData
    ).pipe(
      catchError(error => {
        console.error('Error al registrar producto:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Valida los datos de un producto antes de registrarlo
   * Esta es una validación del lado del cliente
   * 
   * @param data - Datos del producto a validar
   * @returns Objeto con el resultado de la validación y errores si existen
   */
  validarDatosProducto(data: RegistrarProductoRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre
    if (!data.nombre || data.nombre.trim().length === 0) {
      errors.push('El nombre del producto es obligatorio');
    }

    // Validar código SKU
    if (!data.codigo_sku || data.codigo_sku.trim().length === 0) {
      errors.push('El código SKU es obligatorio');
    }

    // Validar categoría
    if (!data.categoria || data.categoria.trim().length === 0) {
      errors.push('La categoría es obligatoria');
    }

    // Validar precio unitario
    if (!data.precio_unitario || data.precio_unitario <= 0) {
      errors.push('El precio unitario debe ser mayor a 0');
    }

    // Validar condiciones de almacenamiento
    if (!data.condiciones_almacenamiento || data.condiciones_almacenamiento.trim().length === 0) {
      errors.push('Las condiciones de almacenamiento son obligatorias');
    }

    // Validar fecha de vencimiento
    if (!data.fecha_vencimiento) {
      errors.push('La fecha de vencimiento es obligatoria');
    } else {
      const fechaVencimiento = new Date(data.fecha_vencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaVencimiento < hoy) {
        errors.push('La fecha de vencimiento debe ser futura');
      }
    }

    // Validar bodega
    if (!data.bodega || data.bodega.trim().length === 0) {
      errors.push('La bodega es obligatoria');
    }

    // Validar lote
    if (!data.lote || data.lote.trim().length === 0) {
      errors.push('El lote es obligatorio');
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
   * 
   * @param formValue - Valores del formulario
   * @param certificaciones - Array de archivos
   * @returns Request formateado para el API
   */
  mapearFormularioARequest(formValue: any, certificaciones: File[]): RegistrarProductoRequest {
    return {
      nombre: formValue.nombreProducto,
      codigo_sku: formValue.codigoSku,
      categoria: formValue.categoria,
      precio_unitario: parseFloat(formValue.precioUnitario),
      condiciones_almacenamiento: formValue.condicionesAlmacenamiento,
      fecha_vencimiento: formValue.fechaVencimiento,
      bodega: formValue.bodega,
      lote: formValue.lote,
      certificaciones: certificaciones
    };
  }
}
