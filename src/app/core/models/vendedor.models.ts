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
  id: number;
  nombres: string;
  apellidos: string;
  zona: string;
  estado: string;
  telefono: string;
  email: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interfaz para los datos completos de un vendedor
 */
export interface Vendedor {
  id: number;
  nombres: string;
  apellidos: string;
  zona: string;
  estado: string;
  telefono: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}
