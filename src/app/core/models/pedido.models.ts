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
}

export interface ObtenerPedidosResponse {
  data: Pedido[];
}
