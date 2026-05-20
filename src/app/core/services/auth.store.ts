import { Injectable, computed, signal } from '@angular/core';
import { AuthUser } from '../models/auth-user.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  user = signal<AuthUser | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  isLoggedIn = computed(() => this.user() !== null);

  setUser(user: AuthUser) {
    this.user.set(user);
    this.error.set(null);
  }

  setError(message: string) {
    this.error.set(message);
  }

  clear() {
    this.user.set(null);
    this.error.set(null);
  }
}
