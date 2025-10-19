/**
 * Modelos de datos para Productos
 */

/**
 * Interfaz para el request de registro de producto
 */
export interface RegistrarProductoRequest {
  nombre: string;
  codigo_sku: string;
  categoria: string;
  precio_unitario: number;
  condiciones_almacenamiento: string;
  fecha_vencimiento: string;
  bodega: string;
  lote: string;
  certificaciones: File[];
}

/**
 * Interfaz para la respuesta de registro de producto
 */
export interface RegistrarProductoResponse {
  id: number;
  nombre: string;
  codigo_sku: string;
  categoria: string;
  precio_unitario: number;
  condiciones_almacenamiento: string;
  fecha_vencimiento: string;
  bodega: string;
  lote: string;
  certificaciones_urls?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Interfaz para los datos completos de un producto
 */
export interface Producto {
  id: number;
  nombre: string;
  codigo_sku: string;
  categoria: string;
  precio_unitario: number;
  condiciones_almacenamiento: string;
  fecha_vencimiento: string;
  bodega: string;
  lote: string;
  certificaciones_urls?: string[];
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}

/**
 * Interfaz para detalles de errores en carga masiva
 */
export interface DetalleError {
  fila: number;
  sku: string;
  codigo: string;
  error: string;
}

/**
 * Interfaz para detalles de productos exitosos en carga masiva
 */
export interface DetalleExitoso {
  fila: number;
  id: number;
  nombre: string;
  sku: string;
  tiene_certificacion: boolean;
  certificacion?: {
    tipo: string;
    url: string;
    fecha_vencimiento: string;
  };
}

/**
 * Interfaz para el resumen de importación
 */
export interface ResumenImportacion {
  total_filas: number;
  exitosos: number;
  fallidos: number;
}

/**
 * Interfaz para el detalle de la importación
 */
export interface DetalleImportacion {
  estado: 'completado' | 'fallido' | 'parcial';
  mensaje: string;
  procesamiento: 'sincrono' | 'asincrono';
  resumen: ResumenImportacion;
  detalles_exitosos: DetalleExitoso[];
  detalles_errores: DetalleError[];
}

/**
 * Interfaz para la respuesta exitosa de carga masiva de productos
 */
export interface CargaMasivaResponseOk {
  data: {
    envio: DetalleImportacion;
    total: number;
    successful: number;
    failed: number;
    errors: any[];
    valid_rows: any[];
  };
}

/**
 * Interfaz para la respuesta de error de carga masiva de productos
 */
export interface CargaMasivaResponseError {
  codigo: string;
  error: string;
  detail: DetalleImportacion;
}

/**
 * Interfaz para la respuesta de carga masiva de productos (unificada)
 */
export interface CargaMasivaResponse {
  productsProcesados: number;
  errores: number;
  mensaje?: string;
  detalles?: string[];
}
