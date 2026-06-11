import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router      = inject(Router);
  const token       = authService.getToken();

  // No añadir token a la petición de refresh para evitar bucle
  const isRefreshRequest = req.url.includes('/auth/refresh');

  const authReq = token && !isRefreshRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si recibimos 401 y no es la petición de refresh → intentar renovar
      if (error.status === 401 && !isRefreshRequest && authService.getRefreshToken()) {
        return authService.renovarToken().pipe(
          switchMap(res => {
            // Reintentar la petición original con el nuevo token
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.token}` },
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // Si el refresh también falla → sesión expirada, redirigir al login
            authService.logout();
            router.navigateByUrl('/login');
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};