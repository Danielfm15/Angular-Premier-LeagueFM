import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EquipoClasificacion {
  nombre: string;
  partidos_jugados: number;
  partidos_ganados: number;
  partidos_empatados: number;
  partidos_perdidos: number;
  goles_a_favor: number;
  goles_en_contra: number;
  diferencia_goles: number;
  puntos: number;

  logo?: string; // ✅ opcional
}

@Injectable({
  providedIn: 'root',
})
export class ClasificacionService {
  private readonly apiUrl = 'http://localhost:3000/api/clasificacion';

  constructor(private http: HttpClient) {}

  obtenerClasificacion(): Observable<EquipoClasificacion[]> {
    return this.http.get<EquipoClasificacion[]>(this.apiUrl);
  }
}