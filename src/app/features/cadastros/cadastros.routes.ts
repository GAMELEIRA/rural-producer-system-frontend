import { Routes } from '@angular/router';

const T = (title: string) => `${title} | Meu Gestor Rural`;

export const CADASTROS_ROUTES: Routes = [
  {
    path: 'culturas',
    children: [
      {
        path: '',
        title: T('Culturas'),
        loadComponent: () =>
          import('./culturas/cultura-list.component').then((m) => m.CulturaListComponent),
      },
      {
        path: 'novo',
        title: T('Nova cultura'),
        loadComponent: () =>
          import('./culturas/cultura-form.component').then((m) => m.CulturaFormComponent),
      },
      {
        path: ':id',
        title: T('Editar cultura'),
        loadComponent: () =>
          import('./culturas/cultura-form.component').then((m) => m.CulturaFormComponent),
      },
    ],
  },
  {
    path: 'talhoes',
    children: [
      {
        path: '',
        title: T('Talhões'),
        loadComponent: () =>
          import('./talhoes/talhao-list.component').then((m) => m.TalhaoListComponent),
      },
      {
        path: 'novo',
        title: T('Novo talhão'),
        loadComponent: () =>
          import('./talhoes/talhao-form.component').then((m) => m.TalhaoFormComponent),
      },
      {
        path: ':id',
        title: T('Editar talhão'),
        loadComponent: () =>
          import('./talhoes/talhao-form.component').then((m) => m.TalhaoFormComponent),
      },
    ],
  },
  {
    path: 'insumos',
    children: [
      {
        path: '',
        title: T('Insumos'),
        loadComponent: () =>
          import('./insumos/insumo-list.component').then((m) => m.InsumoListComponent),
      },
      {
        path: 'novo',
        title: T('Novo insumo'),
        loadComponent: () =>
          import('./insumos/insumo-form.component').then((m) => m.InsumoFormComponent),
      },
      {
        path: ':id',
        title: T('Editar insumo'),
        loadComponent: () =>
          import('./insumos/insumo-form.component').then((m) => m.InsumoFormComponent),
      },
    ],
  },
  {
    path: 'produtos',
    children: [
      {
        path: '',
        title: T('Produtos'),
        loadComponent: () =>
          import('./produtos/produto-list.component').then((m) => m.ProdutoListComponent),
      },
      {
        path: 'novo',
        title: T('Novo produto'),
        loadComponent: () =>
          import('./produtos/produto-form.component').then((m) => m.ProdutoFormComponent),
      },
      {
        path: ':id',
        title: T('Editar produto'),
        loadComponent: () =>
          import('./produtos/produto-form.component').then((m) => m.ProdutoFormComponent),
      },
    ],
  },
];
