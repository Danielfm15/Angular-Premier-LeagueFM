import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JugadorAlineacion {
  id_jugador: number;
  nombre: string;
  posicion: 'Portero' | 'Defensa' | 'Centrocampista' | 'Delantero' | string;
  equipo: string;
  precio: number;
  puntos: number;
}

export interface AlineacionItemBackend {
  id_registro: number;
  nombre: string;
  posicion: string;             // posición real del jugador (Portero/Defensa/...)
  equipo: string;
  posicion_jugador: string;     // posición en el campo (gk, lb, etc.)
  costo_jugador: number;
  puntos: number;
}

export interface GuardarAlineacionItem {
  id: number;
  posicion: string; // ej: "GK", "LB", ...
  costo: number;
}

@Injectable({ providedIn: 'root' })
export class AlineacionService {
  private readonly baseUrl = 'http://localhost:3000/api/alineacion';
  private readonly jornadaUrl = 'http://localhost:3000/api/jornada';

  constructor(private http: HttpClient) {}

  // --- Jornada / permisos (según tu script original) ---
  obtenerJornadaEditable(): Observable<{ jornadaEditable: number }> {
    return this.http.get<{ jornadaEditable: number }>(`${this.jornadaUrl}/editable`);
  }

  verificarEdicionHabilitada(): Observable<{ edicionHabilitada: boolean }> {
    return this.http.get<{ edicionHabilitada: boolean }>(`${this.jornadaUrl}/puede-editar`);
  }

  // --- Jugadores disponibles ---
  obtenerJugadores(): Observable<JugadorAlineacion[]> {
    return this.http.get<JugadorAlineacion[]>(`${this.baseUrl}/jugadores`);
  }

  // --- Cargar alineación guardada ---
  obtenerAlineacion(usuarioId: number, jornadaId: number, idLiga: number): Observable<AlineacionItemBackend[]> {
    const params = new HttpParams()
      .set('usuarioId', String(usuarioId))
      .set('jornadaId', String(jornadaId))
      .set('idLiga', String(idLiga));

    return this.http.get<AlineacionItemBackend[]>(`${this.baseUrl}`, { params });
  }

  // --- Guardar alineación ---
  guardarAlineacion(payload: {
    alineacion: GuardarAlineacionItem[];
    usuarioId: number;
    jornadaId: number;
    idLiga: number;
  }): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.baseUrl}/guardar`, payload);
  }

  // --- Eliminar alineación ---
  eliminarAlineacion(payload: { usuarioId: number; jornadaId: number }): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.baseUrl}/eliminar`, payload);
  }
}
