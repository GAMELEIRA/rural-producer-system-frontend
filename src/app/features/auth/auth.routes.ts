import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        title: 'Entrar | Meu Gestor Rural',
        loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        title: 'Criar conta | Meu Gestor Rural',
        loadComponent: () =>
          import('./pages/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        title: 'Recuperar senha | Meu Gestor Rural',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
    ],
  },
];
