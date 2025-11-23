import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ObtenerZonasResponse, ZonaDetalle } from '../models/ruta.models';

@Injectable({
  providedIn: 'root'
})
export class RutaHttpService {
  private readonly apiUrl = environment.apiProductoUrl;

  constructor(private readonly http: HttpClient) {}

  obtenerZonas(params?: { [key: string]: string | number }): Observable<ObtenerZonasResponse> {
    let httpParams = new HttpParams();

    if (params) {
      for (const key of Object.keys(params)) {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      }
    }

    return this.http.get<ObtenerZonasResponse>(`${this.apiUrl}/zona`, { params: httpParams })
      .pipe(
        catchError(error => {
          console.error('Error al obtener zonas:', error);
          return throwError(() => error);
        })
      );
  }

  obtenerDetalleZona(zonaId: string): Observable<ZonaDetalle> {
    return this.http.get<ZonaDetalle>(`${this.apiUrl}/zona/${zonaId}/detalle`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener detalle de zona:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene los pedidos filtrando por zona.
   * Endpoint esperado: GET /pedido?zona={zonaNombre}
   */
  obtenerPedidosPorZona(zonaNombre: string): Observable<{ data: any[] }>{
    let params = new HttpParams();
    if (zonaNombre) {
      params = params.set('zona', zonaNombre);
    }

    return this.http.get<{ data: any[] }>(`${this.apiUrl}/pedido`, { params })
      .pipe(
        catchError(error => {
          console.error('Error al obtener pedidos por zona:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Calcula la ruta óptima entre la bodega y los destinos (pedidos)
   * Endpoint: POST /ruta-optima
   * Payload: { bodega: [longitud, latitud], destinos: [[longitud, latitud], ...] }
   */
  calcularRutaOptima(bodega: [number, number], destinos: [number, number][]): Observable<any> {
    const payload = {
      bodega,
      destinos
    };

    return this.http.post<any>(`${this.apiUrl}/ruta-optima?formato=json`, payload)
      .pipe(
        catchError(error => {
          console.error('Error al calcular ruta óptima:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene la visualización HTML de la ruta óptima
   * Endpoint: POST /ruta-optima?formato=html
   * Payload: { bodega: [longitud, latitud], destinos: [[longitud, latitud], ...] }
   */
  obtenerRutaOptimaHTML(bodega: [number, number], destinos: [number, number][]): Observable<string> {
    const payload = {
      bodega,
      destinos
    };

    return this.http.post(`${this.apiUrl}/ruta-optima?formato=html`, payload, {
      responseType: 'text'
    })
      .pipe(
        catchError(error => {
          console.error('Error al obtener HTML de ruta óptima:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Registra una nueva ruta en el sistema
   * Endpoint: POST /rutas
   * Payload: { ruta: [{ubicacion, pedido_id}], bodega_id, camion_id, zona_id, estado }
   */
  registrarRuta(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rutas`, request)
      .pipe(
        catchError(error => {
          console.error('Error al registrar ruta:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene el listado de rutas con filtros y paginación
   * Endpoint: GET /rutas
   */
  obtenerRutas(params?: { [key: string]: string | number }): Observable<{ data: any[]; total: number }> {
    let httpParams = new HttpParams();

    if (params) {
      for (const key of Object.keys(params)) {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      }
    }

    return this.http.get<{ data: any[]; total: number }>(`${this.apiUrl}/rutas`, { params: httpParams })
      .pipe(
        catchError(error => {
          console.error('Error al obtener rutas:', error);
          return throwError(() => error);
        })
      );
  }
}
