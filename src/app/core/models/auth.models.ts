/**
 * Modelo para la solicitud de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Modelo para el usuario en la respuesta de login
 */
export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Modelo para la respuesta de login
 */
export interface LoginResponse {
  access_token: string;
  message: string;
  user: User;
}
