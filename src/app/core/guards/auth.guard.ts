import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../services/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // ✅ Usuario logeado → dejamos pasar
  if (authStore.isLoggedIn()) {
    return true;
  }

  // ✅ Usuario NO logeado → devolvemos UrlTree
  return router.createUrlTree(['/login']);
};
