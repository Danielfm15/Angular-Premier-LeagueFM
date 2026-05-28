import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { AuthUser } from '../models/auth-user.model';

type AuthResponse = { mensaje: string; usuario: AuthUser };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:3000/api/auth';

  /** Usuario autenticado en memoria */
  private currentUser: AuthUser | null = null;

  constructor() {
    // 🔁 Recuperar sesión al refrescar la página
    const storedUser = sessionStorage.getItem('auth_user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  login(email: string, contrasena: string) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, contrasena })
      .pipe(
        map(r => r.usuario),
        tap(usuario => this.setSession(usuario))
      );
  }

  registro(nombre: string, email: string, contrasena: string) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/registro`, {
        nombre,
        email,
        contrasena,
      })
      .pipe(
        map(r => r.usuario),
        tap(usuario => this.setSession(usuario))
      );
  }

  /** Obtener usuario autenticado */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /** Cerrar sesión */
  logout(): void {
    this.currentUser = null;
    sessionStorage.removeItem('auth_user');
  }

  /** Guardar sesión */
  private setSession(usuario: AuthUser): void {
    this.currentUser = usuario;
    sessionStorage.setItem('auth_user', JSON.stringify(usuario));
  }
}