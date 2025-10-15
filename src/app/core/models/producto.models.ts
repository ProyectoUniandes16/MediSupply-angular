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
