import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { AuthUser } from '../models/auth-user.model';

type AuthResponse = { mensaje: string; usuario: AuthUser };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // Igual que tu JS: http://localhost:3000/api/auth/...
  // Luego lo profesionalizamos con environment + proxy.
  private baseUrl = 'http://localhost:3000/api/auth';

  login(email: string, contrasena: string) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, contrasena })
      .pipe(map(r => r.usuario));
  }

  registro(nombre: string, email: string, contrasena: string) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/registro`, { nombre, email, contrasena })
      .pipe(map(r => r.usuario));
  }
}