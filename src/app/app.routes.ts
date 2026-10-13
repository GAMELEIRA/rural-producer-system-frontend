import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: 'aplicacoes-insumo', title: 'Aplicações de insumo | Meu Gestor Rural', loadComponent: () => import('./features/operacoes/aplicacoes-insumo.component').then(m => m.AplicacoesInsumoComponent) },
      { path: 'perdas', title: 'Perdas | Meu Gestor Rural', loadComponent: () => import('./features/operacoes/perdas.component').then(m => m.PerdasComponent) },
      { path: 'gastos', title: 'Gastos | Meu Gestor Rural', loadComponent: () => import('./features/operacoes/gastos.component').then(m => m.GastosComponent) },
      { path: 'financeiro', title: 'Resumo financeiro | Meu Gestor Rural', loadComponent: () => import('./features/financeiro/financeiro.component').then(m => m.FinanceiroComponent) },
      { path: 'safras', title: 'Safras | Meu Gestor Rural', loadComponent: () => import('./features/producao/safras.component').then(m => m.SafrasComponent) },
      { path: 'plantacoes', title: 'Plantações | Meu Gestor Rural', loadComponent: () => import('./features/producao/plantacoes.component').then(m => m.PlantacoesComponent) },
      {
        path: '',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: '',
        loadChildren: () =>
          import('./features/cadastros/cadastros.routes').then((m) => m.CADASTROS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
