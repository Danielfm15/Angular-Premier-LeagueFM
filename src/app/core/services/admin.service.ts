import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JornadaConfig {
  id: number;
  jornada_activa: number;
  edicion_habilitada: boolean;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = 'http://localhost:3000/api/jornada/admin';

  constructor(private http: HttpClient) {}

  obtenerConfig(): Observable<JornadaConfig> {
    return this.http.get<JornadaConfig>(`${this.baseUrl}/config`);
  }

  actualizarJornada(jornada_activa: number): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/jornada`, { jornada_activa });
  }

  toggleEdicion(edicion_habilitada: boolean): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/edicion`, { edicion_habilitada });
  }

  importarCSV(file: File): Observable<{ mensaje: string; insertados: number; errores: number; jornada: number }> {
    const formData = new FormData();
    formData.append('csv', file);
    return this.http.post<any>(`${this.baseUrl}/importar-csv`, formData);
  }
}