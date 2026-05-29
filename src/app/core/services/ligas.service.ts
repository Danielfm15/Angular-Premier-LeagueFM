import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Liga } from '../models/liga.model';

@Injectable({
  providedIn: 'root',
})
export class LigasService {
  private readonly apiUrl = 'http://localhost:3000/api/ligas';

  constructor(private http: HttpClient) {}

 obtenerLigasUsuario(idUsuario: number) {
  return this.http.get<{ exito: boolean; ligas: Liga[] }>(
    `http://localhost:3000/api/ligas/participante/${idUsuario}`
  );
}


  

  crearLiga(
    nombre: string,
    codigo: string,
    idUsuario: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, {
      nombre,
      codigo,
      id_usuario: idUsuario,
    });
  }

  unirseALiga(
    codigo: string,
    idUsuario: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/unirse`, {
      codigo,
      id_usuario: idUsuario,
    });
  }
}