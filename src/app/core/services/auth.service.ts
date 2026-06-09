import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { AuthUser } from '../models/auth-user.model';

type AuthResponse = { mensaje: string; token: string; usuario: AuthUser };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/auth';

  // Signals (antes en AuthStore)
  private _user    = signal<AuthUser | null>(null);
  loading          = signal(false);
  error            = signal<string | null>(null);

  // Computed reactivo (antes en AuthStore)
  isLoggedInSignal = computed(() => this._user() !== null);

  private token: string | null = null;

  constructor() {
    const storedUser  = sessionStorage.getItem('auth_user');
    const storedToken = sessionStorage.getItem('auth_token');
    if (storedUser && storedToken) {
      this._user.set(JSON.parse(storedUser));
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
      .pipe(map(r => r.usuario));
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): AuthUser | null {
    return this._user();
  }

  // Método normal (para el guard)
  isLoggedIn(): boolean {
    return !!this.token && !!this._user();
  }

  // Métodos que usaba AuthStore
  setUser(user: AuthUser): void {
    this._user.set(user);
    this.error.set(null);
  }

  setError(message: string): void {
    this.error.set(message);
  }

  logout(): void {
    this._user.set(null);
    this.token = null;
    this.error.set(null);
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
  }

  private setSession(usuario: AuthUser, token: string): void {
    this._user.set(usuario);
    this.token = token;
    sessionStorage.setItem('auth_user', JSON.stringify(usuario));
    sessionStorage.setItem('auth_token', token);
  }
}