/**
 * Modelos de datos para Planes de Venta
 */

/**
 * Información resumida de un vendedor asociado a un plan
 */
export interface VendedorPlan {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  zona: string;
}

/**
 * Interfaz para el request de registro de plan de venta
 * Los nombres coinciden con la API del backend
 */
export interface RegistrarPlanVentaRequest {
  nombre_plan: string;
  gerente_id: string;
  vendedores_ids: string[];
  periodo: string;
  meta_ingresos: number;
  meta_visitas: number;
  meta_clientes_nuevos: number;
  estado: string;
  plan_id?: string;
}

/**
 * Interfaz para la respuesta de registro de plan de venta
 */
export interface RegistrarPlanVentaResponse {
  id: string;
  nombre_plan: string;
  gerente_id: string;
  vendedores_ids: string[];
  periodo: string;
  meta_ingresos: number;
  meta_visitas: number;
  meta_clientes_nuevos: number;
  estado: string;
  plan_id?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

/**
 * Interfaz para los datos completos de un plan de venta
 */
export interface PlanVenta {
  id: string;
  nombre_plan: string;
  gerente_id: string;
  vendedores_ids: string[];
  vendedores: VendedorPlan[];
  periodo: string;
  meta_ingresos: number;
  meta_visitas: number;
  meta_clientes_nuevos: number;
  estado: string;
  plan_id?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

/**
 * Parámetros para consulta de planes de venta
 */
export interface ObtenerPlanesVentaParams {
  page?: number;
  size?: number;
  vendedor_id?: string;
  nombre_plan?: string;
  estado?: string;
}

/**
 * Respuesta paginada de planes de venta
 */
export interface ObtenerPlanesVentaResponse {
  items: PlanVenta[];
  page: number;
  pages: number;
  size: number;
  total: number;
}

