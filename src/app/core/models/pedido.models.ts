/**
 * Modelos para Pedidos
 */

export interface Pedido {
  id: number;
  cliente_id: number;
  vendedor_id: string;
  fecha_pedido: string;
  estado: string;
  total: number;
  latitud?: number;
  longitud?: number;
  direccion?: string;
  nombre?: string;
  codigo?: string;
}

export interface ObtenerPedidosResponse {
  data: Pedido[];
}
