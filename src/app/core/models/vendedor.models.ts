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

/**
 * Interfaz para el reporte de ventas de un vendedor
 */
export interface ReporteVentasVendedor {
  metricas: {
    clientes_unicos: number;
    cumplimiento_porcentaje: number;
    meta_ingresos_total: number;
    monto_promedio: number;
    monto_total: number;
    ventas_realizadas: number;
  };
  pedidos_detalle: PedidoDetalle[];
  periodo: {
    anio: number;
    mes: number;
    mes_nombre: string;
    periodo_formato: string;
  };
  planes: PlanVenta[];
  vendedor: {
    correo: string;
    id: string;
    nombre_completo: string;
    zona: string;
  };
}

export interface PedidoDetalle {
  cliente: string;
  fecha: string;
  id: string;
  monto: number;
  productos: number;
}

export interface PlanVenta {
  id: string;
  meta_ingresos: number;
  periodo: string;
}
