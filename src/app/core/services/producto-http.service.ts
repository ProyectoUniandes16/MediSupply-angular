import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  RegistrarProductoRequest,
  RegistrarProductoResponse,
  ObtenerProductosResponse,
  ObtenerProductoDetalleResponse,
  ObtenerInventariosProductoResponse,
  ProductoDetalle
} from '../models/producto.models';

/**
 * Servicio HTTP para la gestión de productos
 * Maneja las llamadas HTTP al backend para operaciones CRUD de productos
 */
@Injectable({
  providedIn: 'root'
})
export class ProductoHttpService {
  private readonly apiUrl = environment.apiProductoUrl || '/api';

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

    // Formatear fecha de vencimiento a DD/MM/AAAA
    const fechaFormateada = this.formatearFecha(data.fecha_vencimiento);

    // Agregar campos de texto al FormData
    formData.append('nombre', data.nombre);
    formData.append('codigo_sku', data.codigo_sku);
    formData.append('categoria', data.categoria);
    formData.append('precio_unitario', data.precio_unitario.toString());
    formData.append('condiciones_almacenamiento', data.condiciones_almacenamiento);
    formData.append('fecha_vencimiento', fechaFormateada);
    formData.append('ubicacion', data.ubicacion);
    formData.append('proveedor_id', '1234');
    formData.append('lote', data.lote);
    formData.append('cantidad_inicial', data.cantidad_inicial.toString());
    formData.append('fecha_vencimiento_cert', fechaFormateada);
    formData.append('tipo_certificacion', 'INVIMA');

    // Agregar archivos de certificaciones al FormData
    if (data.certificaciones && data.certificaciones.length > 0) {
      for (const file of data.certificaciones) {
        formData.append('certificacion', file, file.name);
      }
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
    if (data.fecha_vencimiento) {
      const fechaVencimiento = new Date(data.fecha_vencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaVencimiento < hoy) {
        errors.push('La fecha de vencimiento debe ser futura');
      }
    } else {
      errors.push('La fecha de vencimiento es obligatoria');
    }

    // Validar bodega
    if (!data.ubicacion || data.ubicacion.trim().length === 0) {
      errors.push('La ubicación es obligatoria');
    }

    // Validar lote
    if (!data.lote || data.lote.trim().length === 0) {
      errors.push('El lote es obligatorio');
    }

    // Validar cantidad inicial
    if (!data.cantidad_inicial || data.cantidad_inicial <= 0) {
      errors.push('La cantidad inicial debe ser mayor a 0');
    }

    // Validar certificaciones
    if (!data.certificaciones || data.certificaciones.length === 0) {
      errors.push('Debe adjuntar al menos una certificación');
    } else {
      // Validar tamaño y tipo de archivos
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);

      for (const file of data.certificaciones) {
        if (file.size > maxSize) {
          errors.push(`El archivo "${file.name}" excede el tamaño máximo de 5MB`);
        }
        if (!allowedTypes.has(file.type)) {
          errors.push(`El archivo "${file.name}" no es un formato válido (PDF, JPG, PNG)`);
        }
      }
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
      precio_unitario: Number.parseFloat(formValue.precioUnitario),
      condiciones_almacenamiento: formValue.condicionesAlmacenamiento,
      fecha_vencimiento: formValue.fechaVencimiento,
      ubicacion: formValue.bodega,
      lote: formValue.lote,
      cantidad_inicial: Number.parseInt(formValue.cantidadInicial, 10),
      certificaciones: certificaciones
    };
  }

  /**
   * Formatea una fecha al formato DD/MM/AAAA
   * 
   * @param fecha - Fecha en formato string (YYYY-MM-DD) o Date
   * @returns Fecha formateada como DD/MM/AAAA
   */
  private formatearFecha(fecha: string | Date): string {
    let fechaObj: Date;
    
    if (typeof fecha === 'string') {
      // Para fechas en formato YYYY-MM-DD, parsear directamente sin zona horaria
      const [year, month, day] = fecha.split('-').map(num => Number.parseInt(num, 10));
      fechaObj = new Date(year, month - 1, day);
    } else {
      fechaObj = fecha;
    }
    
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const anio = fechaObj.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
  }

  /**
   * Carga masiva de productos desde un archivo CSV
   * 
   * @param file - Archivo CSV con los productos
   * @returns Observable con la respuesta del servidor
   * 
   * Endpoint: POST /api/producto-batch
   * Content-Type: multipart/form-data
   */
  cargarProductosMasivo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<any>(
      `${this.apiUrl}/producto-batch`,
      formData
    ).pipe(
      catchError(error => {
        console.error('Error en carga masiva:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene la lista de productos con paginación y filtros
   * 
   * @param params - Parámetros de paginación y filtros
   * @returns Observable con la respuesta paginada de productos
   * 
   * Endpoint: GET /api/producto
   * 
   * @example
   * const params = {
   *   page: 1,
   *   size: 10,
   *   nombre: 'Paracetamol',
   *   categoria: 'medicamento',
   *   estado: 'Activo'
   * };
   * 
   * this.productoHttpService.obtenerProductos(params).subscribe({
   *   next: (response) => console.log('Productos:', response),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  obtenerProductos(params?: any): Observable<ObtenerProductosResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      for (const key of Object.keys(params)) {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      }
    }

    return this.http.get<ObtenerProductosResponse>(`${this.apiUrl}/producto`, {
      params: httpParams
    }).pipe(
      catchError(error => {
        console.error('Error al obtener productos:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el detalle de un producto por su ID
   * 
   * @param id - ID del producto a obtener
   * @returns Observable con el detalle del producto
   * 
   * Endpoint: GET /api/producto/{id}
   * 
   * @example
   * this.productoHttpService.obtenerProductoPorId(1).subscribe({
   *   next: (producto) => console.log('Producto:', producto),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  obtenerProductoPorId(id: number): Observable<ProductoDetalle> {
    return this.http.get<ObtenerProductoDetalleResponse>(`${this.apiUrl}/producto/${id}`).pipe(
      map(response => response.data.producto),
      catchError(error => {
        console.error(`Error al obtener producto ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene los inventarios de un producto por su ID
   * 
   * @param id - ID del producto
   * @returns Observable con la información de inventarios del producto
   * 
   * Endpoint: GET /api/producto/{id}/inventarios
   * 
   * @example
   * this.productoHttpService.obtenerInventariosProducto(52).subscribe({
   *   next: (response) => console.log('Inventarios:', response),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  obtenerInventariosProducto(id: number): Observable<ObtenerInventariosProductoResponse> {
    return this.http.get<ObtenerInventariosProductoResponse>(`${this.apiUrl}/producto/${id}/inventarios`).pipe(
      catchError(error => {
        console.error(`Error al obtener inventarios del producto ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}
