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
  ubicacion: string;
  lote: string;
  cantidad_inicial: number;
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
  cantidad_disponible: number;
  condiciones_almacenamiento: string;
  fecha_vencimiento: string;
  fecha_registro: string;
  fecha_actualizacion: string;
  estado: string;
  proveedor_id: number;
  tiene_certificacion: boolean;
  usuario_registro: string;
  // Campos legacy para compatibilidad
  bodega?: string;
  lote?: string;
  certificaciones_urls?: string[];
  created_at?: string;
  updated_at?: string;
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
  estado: 'completado' | 'fallido' | 'parcial' | 'EN_COLA' | 'PROCESANDO';
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

/**
 * Interfaz para un job de importación CSV
 */
export interface ImportJobItem {
  estado: string;
  exitosos: number;
  fallidos: number;
  fecha_creacion: string;
  fecha_finalizacion: string | null;
  fecha_inicio_proceso: string | null;
  filas_procesadas: number;
  job_id: string;
  local_path: string;
  nombre_archivo: string;
  progreso: number;
  reintentos: number;
  tiempo_transcurrido_segundos: number | null;
  total_filas: number;
  usuario_registro: string;
}

/**
 * Interfaz para los filtros de jobs
 */
export interface JobsFiltros {
  estado: string | null;
  usuario: string | null;
}

/**
 * Interfaz para la paginación de jobs
 */
export interface JobsPaginacion {
  limit: number;
  offset: number;
  tiene_mas: boolean;
  total: number;
}

/**
 * Interfaz para la respuesta del endpoint GET /importar-csv/jobs
 */
export interface ObtenerJobsResponse {
  data: {
    filtros: JobsFiltros;
    jobs: ImportJobItem[];
    paginacion: JobsPaginacion;
  };
}

/**
 * Interfaz para los filtros aplicados en la consulta de productos
 */
export interface FiltrosProductos {
  buscar: string | null;
  categoria: string | null;
  estado: string | null;
  proveedor_id: number | null;
}

/**
 * Interfaz para la información de paginación de productos
 */
export interface PaginacionProductos {
  pagina_actual: number;
  productos_por_pagina: number;
  tiene_anterior: boolean;
  tiene_siguiente: boolean;
  total_paginas: number;
  total_productos: number;
}

/**
 * Interfaz para la respuesta paginada de obtención de productos
 */
export interface ObtenerProductosResponse {
  data: {
    filtros_aplicados: FiltrosProductos;
    paginacion: PaginacionProductos;
    productos: Producto[];
  };
}

/**
 * Interfaz para la información de certificación de un producto
 */
export interface Certificacion {
  id: number;
  tipo_certificacion: string;
  nombre_archivo: string;
  tamano_archivo: number;
  url_descarga: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: string;
}

/**
 * Interfaz para la información de inventario de un producto
 */
export interface InventarioProducto {
  cantidad_disponible: number;
  tiene_stock: boolean;
}

/**
 * Interfaz para el detalle completo de un producto
 */
export interface ProductoDetalle {
  id: number;
  nombre: string;
  codigo_sku: string;
  categoria: string;
  precio_unitario: number;
  condiciones_almacenamiento: string;
  fecha_vencimiento: string;
  estado: string;
  proveedor_id: number;
  inventario: InventarioProducto;
  certificaciones: Certificacion[];
}

/**
 * Interfaz para la respuesta de obtención de detalle de producto
 */
export interface ObtenerProductoDetalleResponse {
  data: {
    producto: ProductoDetalle;
  };
}

/**
 * Interfaz para un registro de inventario de producto
 */
export interface InventarioDetalle {
  id: string;
  productoId: number;
  productoNombre?: string;
  productoSku?: string;
  ubicacion: string;
  cantidad: number;
  usuarioCreacion: string;
  usuarioActualizacion: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

/**
 * Interfaz para la respuesta de inventarios de un producto
 */
export interface ObtenerInventariosProductoResponse {
  data: {
    productoId: string;
    inventarios: InventarioDetalle[];
    total: number;
    totalCantidad: number;
    source: string;
  };
}

/**
 * Interfaz para la respuesta de inventarios por ubicación
 */
export interface ObtenerInventariosPorUbicacionResponse {
  inventarios: InventarioDetalle[];
  total: number;
  limite: number;
  offset: number;
}

/**
 * Interfaz para los detalles de errores en el status del job
 */
export interface DetallesErroresJob {
  errores: DetalleError[];
  errores_capturados: number;
  nota: string;
  total_errores: number;
}

/**
 * Interfaz para las validaciones del job
 */
export interface ValidacionesJob {
  nota: string;
  productos_con_errores: number;
  productos_validados_ok: number;
  tasa_exito: number;
}

/**
 * Interfaz para el status detallado de un job de importación
 */
export interface JobStatusDetalle {
  detalles_errores: DetallesErroresJob;
  estado: string;
  exitosos: number;
  fallidos: number;
  fecha_creacion: string;
  fecha_finalizacion: string | null;
  fecha_inicio_proceso: string | null;
  filas_procesadas: number;
  job_id: string;
  local_path: string;
  mensaje: string;
  nombre_archivo: string;
  progreso: number;
  reintentos: number;
  tiempo_transcurrido_segundos: number;
  total_filas: number;
  usuario_registro: string;
  validaciones: ValidacionesJob;
}

/**
 * Interfaz para la respuesta del endpoint GET /importar-csv/status/{job_id}
 */
export interface ObtenerJobStatusResponse {
  data: JobStatusDetalle;
}
