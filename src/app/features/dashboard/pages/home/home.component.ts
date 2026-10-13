import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { ProducaoService, Plantacao } from '../../../producao/producao.service';
import { environment } from '../../../../../environments/environment';
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
export class HomeComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly producaoApi = inject(ProducaoService);
  protected readonly colheitas = signal<{mes:string;quantidade:number}[]>([]);
  protected readonly maiorColheita = () => Math.max(1,...this.colheitas().map(x => x.quantidade));
  protected readonly resumo = signal<{ totalPlantacoesAtivas:number; totalSafrasEmAndamento:number; receitaTotalVendas:number; despesasTotais:number; saldoLiquido:number; totalVendasRealizadas:number } | null>(null);
  protected readonly graficos = signal<{vendasPorMes:{mesAno:string;total:number}[]; statusPlantacoes:{status:string;quantidade:number}[]} | null>(null);
  protected readonly dashboardError = signal(false);
  protected readonly maiorVenda = () => Math.max(1, ...(this.graficos()?.vendasPorMes.map(x => x.total) ?? []));
  ngOnInit(): void { this.carregarDashboard(); }
  protected carregarDashboard(): void { forkJoin({resumo:this.http.get<NonNullable<ReturnType<typeof this.resumo>>>(environment.apiUrl + '/dashboard/resumo'), graficos:this.http.get<NonNullable<ReturnType<typeof this.graficos>>>(environment.apiUrl + '/dashboard/graficos'),plantacoes:this.producaoApi.listarPlantacoes()}).subscribe({next:({resumo,graficos,plantacoes})=>{const mapa = new Map<string,number>(); for(const p of plantacoes){if(p.dataColheita && p.quantidadeColhida != null && (p.status==='COLHIDA'||p.status==='COLHIDO')){const mes=p.dataColheita.slice(0,7);mapa.set(mes,(mapa.get(mes)||0)+Number(p.quantidadeColhida));}}this.colheitas.set([...mapa.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([mes,quantidade])=>({mes,quantidade})));this.resumo.set(resumo);this.graficos.set(graficos);this.dashboardError.set(false);},error:()=>this.dashboardError.set(true)}); }

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
    { label: 'Safras', description: 'Gerencie os períodos de produção.', icon: '📅', route: '/safras' },
    { label: 'Plantações', description: 'Acompanhe os cultivos e registre colheitas.', icon: '🌾', route: '/plantacoes' },
  ];
}
