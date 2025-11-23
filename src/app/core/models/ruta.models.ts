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

export interface RutaDetalle {
  id: string;
  ruta_id: string;
  pedido_id: string;
  ubicacion: [number, number];
  orden: number;
  estado: string;
  fecha_visita: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ruta {
  id: string;
  zona_id: string;
  bodega_id: string;
  camion_id: string;
  estado: string;
  fecha_asignacion: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  created_at: string;
  updated_at: string;
  zona?: {
    id: string;
    nombre: string;
    descripcion: string | null;
  };
  bodega?: {
    id: string;
    nombre: string;
    ubicacion: string;
  };
  camion?: {
    id: string;
    placa: string;
    capacidad_kg: number;
    capacidad_m3: number;
    disponible: boolean;
    estado: string;
    tipo?: {
      id: string;
      nombre: string;
      descripcion: string;
    };
  };
  detalles?: RutaDetalle[];
}

export interface ObtenerRutasResponse {
  data: Ruta[];
  total: number;
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

export interface BodegaSimple {
  id: string;
  nombre: string;
  ubicacion: string;
  created_at: string;
  updated_at: string;
}

export interface ObtenerBodegasResponse {
  data: BodegaSimple[];
  total: number;
}
