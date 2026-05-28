import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../services/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // ✅ Usuario logueado → permitimos acceso
  if (authStore.isLoggedIn()) {
    return true;
  }

  // ❌ Usuario NO logueado → redirigimos a login
  return router.createUrlTree(['/login']);
};
