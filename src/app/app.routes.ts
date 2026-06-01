import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ClasificacionLigaComponent } from './features/ligas/clasificacion-liga/clasificacion-liga.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'index',
    pathMatch: 'full',
  },

  
{
    path: 'ligas/:idLiga/clasificacion',
    component: ClasificacionLigaComponent
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
    path: 'contacto',
    loadComponent: () =>
      import('./features/legal/contacto/contacto.component').then(
        (m) => m.ContactoComponent,
      ),
  },

  {
    path: 'clasificacion',
    loadComponent: () =>
      import('./features/clasificacion/clasificacion.component').then(
        (m) => m.ClasificacionComponent,
      ),
  },

  {
    path: 'mercado',
    loadComponent: () =>
      import('./features/mercado/mercado.component').then(
        (m) => m.MercadoComponent,
      ),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },

  
{
    path: 'ligas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ligas/ligas.component').then(
        m => m.LigasComponent
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
