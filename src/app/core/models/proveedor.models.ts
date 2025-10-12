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
  certificaciones_urls?: string[];
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}
