/**
 * Modelos de datos para Proveedores
 */

/**
 * Interfaz para el request de registro de proveedor
 * Los nombres coinciden con la API del backend
 */
export interface RegistrarProveedorRequest {
  nombre: string;
  nit: string;
  pais: string;
  direccion: string;
  nombre_contacto: string;
  email: string;
  telefono: string;
  certificaciones: File[];
}

/**
 * Interfaz para la respuesta de registro de proveedor
 */
export interface RegistrarProveedorResponse {
  id: number;
  nombre: string;
  nit: string;
  pais: string;
  direccion: string;
  nombre_contacto: string;
  email: string;
  telefono: string;
  certificaciones_urls?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Interfaz para los datos completos de un proveedor
 */
export interface Proveedor {
  id: number;
  nombre: string;
  nit: string;
  pais: string;
  direccion: string;
  nombre_contacto: string;
  email: string;
  telefono: string;
  estado: string;
  estado_certificacion: string;
  fecha_registro: string;
  total_certificaciones: number;
  certificaciones_urls?: string[];
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

/**
 * Interfaz para la paginación
 */
export interface Paginacion {
  pagina: number;
  por_pagina: number;
  total: number;
  total_paginas: number;
}

/**
 * Interfaz para la respuesta de consulta de proveedores
 */
export interface ConsultarProveedoresResponse {
  data: Proveedor[];
  mensaje: string;
  paginacion: Paginacion;
}
