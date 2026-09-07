import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    title: 'Início | Meu Gestor Rural',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
];
