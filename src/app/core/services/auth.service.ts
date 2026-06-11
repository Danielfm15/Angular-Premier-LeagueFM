import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { AuthUser } from '../models/auth-user.model';

type AuthResponse = { mensaje: string; token: string; refreshToken: string; usuario: AuthUser };
type RefreshResponse = { token: string; refreshToken: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/auth';

  private _user        = signal<AuthUser | null>(null);
  loading              = signal(false);
  error                = signal<string | null>(null);
  isLoggedInSignal     = computed(() => this._user() !== null);

  private token: string | null        = null;
  private refreshToken: string | null = null;

  constructor() {
    const storedUser         = sessionStorage.getItem('auth_user');
    const storedToken        = sessionStorage.getItem('auth_token');
    const storedRefreshToken = sessionStorage.getItem('auth_refresh_token');

    if (storedUser && storedToken && storedRefreshToken) {
      this._user.set(JSON.parse(storedUser));
      this.token        = storedToken;
      this.refreshToken = storedRefreshToken;
    }
  }

  login(email: string, contrasena: string) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, contrasena })
      .pipe(
        map(r => ({ usuario: r.usuario, token: r.token, refreshToken: r.refreshToken })),
        tap(({ usuario, token, refreshToken }) => this.setSession(usuario, token, refreshToken))
      );
  }

  registro(nombre: string, email: string, contrasena: string) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/registro`, { nombre, email, contrasena })
      .pipe(map(r => r.usuario));
  }

  // Llamado automáticamente por el interceptor cuando el access token expira
  renovarToken(): Observable<RefreshResponse> {
    return this.http
      .post<RefreshResponse>(`${this.baseUrl}/refresh`, {
        refreshToken: this.refreshToken,
      })
      .pipe(
        tap(res => {
          this.token        = res.token;
          this.refreshToken = res.refreshToken;
          sessionStorage.setItem('auth_token', res.token);
          sessionStorage.setItem('auth_refresh_token', res.refreshToken);
        })
      );
  }

  getToken(): string | null        { return this.token; }
  getRefreshToken(): string | null { return this.refreshToken; }
  getCurrentUser(): AuthUser | null { return this._user(); }
  isLoggedIn(): boolean            { return !!this.token && !!this._user(); }

  setUser(user: AuthUser): void  { this._user.set(user); this.error.set(null); }
  setError(msg: string): void    { this.error.set(msg); }

  logout(): void {
    // Avisar al backend para borrar el refresh token de la BD
    if (this.refreshToken) {
      this.http.post(`${this.baseUrl}/logout`, {
        refreshToken: this.refreshToken,
      }).subscribe();
    }

    this._user.set(null);
    this.token        = null;
    this.refreshToken = null;
    this.error.set(null);
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_refresh_token');
  }

  private setSession(usuario: AuthUser, token: string, refreshToken: string): void {
    this._user.set(usuario);
    this.token        = token;
    this.refreshToken = refreshToken;
    sessionStorage.setItem('auth_user', JSON.stringify(usuario));
    sessionStorage.setItem('auth_token', token);
    sessionStorage.setItem('auth_refresh_token', refreshToken);
  }
}