import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'index',
    pathMatch: 'full',
  },

  {
    path: 'index',
    loadComponent: () =>
      import('./features/index/index.component').then((m) => m.IndexComponent),
  },

  {
    path: 'avisolegal',
    loadComponent: () =>
      import('./features/legal/aviso-legal/aviso-legal.component').then(
        (m) => m.AvisoLegalComponent,
      ),
  },

  {
    path: 'politicas',
    loadComponent: () =>
      import('./features/legal/privacidad/privacidad.component').then(
        (m) => m.PrivacidadComponent,
      ),
  },

  {
    path: 'normas',
    loadComponent: () =>
      import('./features/legal/normas/normas.component').then(
        (m) => m.NormasComponent,
      ),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },

  // EJEMPLO DE RUTA PRIVADA (cuando exista)
  /* {
     path: 'ligas',
     loadComponent: () =>
       import('./features/ligas/ligas.component')
         .then(m => m.LigasComponent),
     canActivate: [authGuard]
   }, */

  {
    path: '**',
    redirectTo: 'index',
  },
];
