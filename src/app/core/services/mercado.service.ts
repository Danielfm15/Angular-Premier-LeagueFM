import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JugadorMercado {
  nombre: string;
  posicion: string;
  estado: string;
  club: string;
  precio: number;
  puntos: number;
  imagen: string;
}

export interface MercadoResponse {
  data: JugadorMercado[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class MercadoService {
  private readonly apiUrl = 'http://localhost:3000/api/mercado';

  constructor(private http: HttpClient) {}

  obtenerJugadores(
    filtros: {
      nombre?: string;
      club?: string;
      posicion?: string;
      valorMaximo?: number;
      puntosMinimos?: number;
    },
    page: number,
    pageSize: number
  ): Observable<MercadoResponse> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<MercadoResponse>(this.apiUrl, { params });
  }
}