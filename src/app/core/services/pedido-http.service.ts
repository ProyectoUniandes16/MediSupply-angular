import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ObtenerPedidosResponse } from '../models/pedido.models';

@Injectable({
  providedIn: 'root'
})
export class PedidoHttpService {
  private readonly apiUrl = environment.apiUrl || '/api';

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene pedidos con filtros opcionales (vendedor, cliente, paginación, etc.)
   */
  obtenerPedidos(params?: any): Observable<ObtenerPedidosResponse> {
    let httpParams = new HttpParams();
    if (params) {
      for (const key of Object.keys(params)) {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key].toString());
        }
      }
    }

    return this.http.get<ObtenerPedidosResponse>(`${this.apiUrl}/pedido`, { params: httpParams }).pipe(
      catchError(err => {
        console.error('Error al obtener pedidos:', err);
        return throwError(() => err);
      })
    );
  }
}
