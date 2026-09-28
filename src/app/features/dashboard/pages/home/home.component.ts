import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

interface Shortcut {
  label: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly auth = inject(AuthService);

  protected readonly shortcuts: Shortcut[] = [
    {
      label: 'Culturas',
      description: 'Tipos de cultura cultivados (milho, soja, tomate...).',
      icon: '🌱',
      route: '/culturas',
    },
    {
      label: 'Talhões',
      description: 'Áreas físicas de cultivo da propriedade.',
      icon: '🗺️',
      route: '/talhoes',
    },
    {
      label: 'Insumos',
      description: 'Sementes, fertilizantes e defensivos em estoque.',
      icon: '🧪',
      route: '/insumos',
    },
    {
      label: 'Produtos',
      description: 'Produtos colhidos disponíveis para venda.',
      icon: '📦',
      route: '/produtos',
    },
  ];
}
