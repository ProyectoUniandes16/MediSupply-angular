/**
 * Modelos de datos para Planes de Venta
 */

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
  periodo: string;
  meta_ingresos: number;
  meta_visitas: number;
  meta_clientes_nuevos: number;
  estado: string;
  plan_id?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}
