export interface TipoCamion {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Camion {
  id: string;
  placa: string;
  capacidad_kg: number;
  capacidad_m3: number;
  estado: string;
  tipo_camion: TipoCamion;
}

export interface Bodega {
  id: string;
  nombre: string;
  ubicacion: string;
  latitud?: number;
  longitud?: number;
  fecha_creacion: string;
  camiones: Camion[];
}

export interface Zona {
  id: string;
  nombre: string;
  latitud_maxima: number;
  latitud_minima: number;
  longitud_maxima: number;
  longitud_minima: number;
  fecha_creacion: string;
}

export interface ZonaDetalle extends Zona {
  bodegas: Bodega[];
}

export interface ObtenerZonasResponse {
  data: Zona[];
  total: number;
}

export interface Ruta {
  id: string;
  zona_id: string;
  bodega_id: string;
  camion_id: string;
  estado: string;
  fecha_creacion: string;
  pedidos?: any[];
}

export interface RutaOptimaRequest {
  bodega: [number, number]; // [longitud, latitud]
  destinos: [number, number][]; // [[longitud, latitud], ...]
}

export interface OrdenOptimo {
  job_id: string | number;
  ubicacion: [number, number];
}

export interface ResumenRuta {
  costo: number;
  distancia_total_metros: number;
  tiempo_servicio_segundos: number;
  tiempo_total_segundos: number;
}

export interface RutaOptimaResponse {
  mensaje: string;
  orden_optimo: OrdenOptimo[];
  resumen: ResumenRuta;
}

export interface RutaParada {
  ubicacion: [number, number]; // [longitud, latitud]
  pedido_id: string;
}

export interface RegistrarRutaRequest {
  ruta: RutaParada[];
  bodega_id: string;
  camion_id: string;
  zona_id: string;
  estado: string;
}
