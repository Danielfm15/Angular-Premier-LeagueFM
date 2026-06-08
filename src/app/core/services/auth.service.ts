import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { AuthUser } from '../models/auth-user.model';

type AuthResponse = { mensaje: string; token: string; usuario: AuthUser };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/auth';

  private currentUser: AuthUser | null = null;
  private token: string | null = null;

  constructor() {
    const storedUser  = sessionStorage.getItem('auth_user');
    const storedToken = sessionStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      this.currentUser = JSON.parse(storedUser);
      this.token = storedToken;
    }
  }

  login(email: string, contrasena: string) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, contrasena })
      .pipe(
        map(r => ({ usuario: r.usuario, token: r.token })),
        tap(({ usuario, token }) => this.setSession(usuario, token))
      );
  }

  registro(nombre: string, email: string, contrasena: string) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/registro`, { nombre, email, contrasena })
      .pipe(
        map(r => r.usuario),
        // El registro no devuelve token, el usuario deberá hacer login
      );
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return !!this.token && !!this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    this.token = null;
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
  }

  private setSession(usuario: AuthUser, token: string): void {
    this.currentUser = usuario;
    this.token = token;
    sessionStorage.setItem('auth_user', JSON.stringify(usuario));
    sessionStorage.setItem('auth_token', token);
  }
}