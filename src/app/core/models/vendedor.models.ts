/**
 * Modelos de datos para Vendedores
 */

/**
 * Interfaz para el request de registro de vendedor
 * Los nombres coinciden con la API del backend
 */
export interface RegistrarVendedorRequest {
  nombre: string;
  apellidos: string;
  zona: string;
  estado: string;
  telefono: string;
  correo: string;
}

/**
 * Interfaz para la respuesta de registro de vendedor
 */
export interface RegistrarVendedorResponse {
  id: string;
  nombre: string;
  apellidos: string;
  zona: string;
  estado: string;
  telefono: string;
  correo: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  usuarioCreacion: string | null;
  usuarioActualizacion: string | null;
}

/**
 * Interfaz para los datos completos de un vendedor
 */
export interface Vendedor {
  id: string;
  nombre: string;
  apellidos: string;
  zona: string;
  estado: string;
  telefono: string;
  correo: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  usuarioCreacion: string | null;
  usuarioActualizacion: string | null;
}

/**
 * Interfaz para la paginación de vendedores
 */
export interface PaginacionVendedores {
  page: number;
  size: number;
  total: number;
}

/**
 * Interfaz para la respuesta de la lista de vendedores
 */
export interface ObtenerVendedoresResponse {
  items: Vendedor[];
  page: number;
  size: number;
  total: number;
}
