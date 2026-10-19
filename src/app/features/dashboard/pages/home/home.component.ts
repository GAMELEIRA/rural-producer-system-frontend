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

interface ResumoDashboard {
  totalPlantacoesAtivas: number;
  totalSafrasEmAndamento: number;
  receitaTotalVendas: number;
  despesasTotais: number;
  saldoLiquido: number;
  totalVendasRealizadas: number;
  custoTotalPerdas: number;
}

interface ResumoFinanceiro {
  custoTotalPerdas: number;
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
  protected readonly resumo = signal<{ totalPlantacoesAtivas:number; totalSafrasEmAndamento:number; receitaTotalVendas:number; despesasTotais:number; saldoLiquido:number; custoTotalPerdas:number; totalVendasRealizadas:number } | null>(null);
  protected readonly graficos = signal<{vendasPorMes:{mesAno:string;total:number}[]; statusPlantacoes:{status:string;quantidade:number}[]} | null>(null);
  protected readonly dashboardError = signal(false);
  protected readonly carregando = signal(false);
  protected readonly maiorVenda = () => Math.max(1, ...(this.graficos()?.vendasPorMes.map(x => x.total) ?? []));
  ngOnInit(): void { this.carregarDashboard(); }
  protected carregarDashboard(): void { this.carregando.set(true);forkJoin({resumo:this.http.get<NonNullable<ReturnType<typeof this.resumo>>>(environment.apiUrl + '/dashboard/resumo'), graficos:this.http.get<NonNullable<ReturnType<typeof this.graficos>>>(environment.apiUrl + '/dashboard/graficos'),plantacoes:this.producaoApi.listarPlantacoes()}).subscribe({next:({resumo,graficos,plantacoes})=>{const mapa = new Map<string,number>(); for(const p of plantacoes){if(p.dataColheita && p.quantidadeColhida != null && (p.status==='COLHIDA'||p.status==='COLHIDO')){const mes=p.dataColheita.slice(0,7);mapa.set(mes,(mapa.get(mes)||0)+Number(p.quantidadeColhida));}}this.colheitas.set([...mapa.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([mes,quantidade])=>({mes,quantidade})));this.resumo.set(resumo);this.graficos.set(graficos);this.dashboardError.set(false);this.carregando.set(false);},error:()=>{this.dashboardError.set(true);this.carregando.set(false);}}); }

  protected readonly auth = inject(AuthService);

  protected readonly shortcuts: Shortcut[] = [
    { label: '1. Safras', description: 'Defina o período da produção.', icon: '📅', route: '/safras' },
    { label: '2. Preparação', description: 'Cadastre culturas, talhões e insumos.', icon: '🌱', route: '/culturas' },
    { label: '3. Plantações', description: 'Registre o plantio e acompanhe a colheita.', icon: '🌾', route: '/plantacoes' },
    { label: '4. Manejo', description: 'Aplique insumos e acompanhe os custos.', icon: '💧', route: '/aplicacoes-insumo' },
    { label: '5. Colheita e estoque', description: 'Registre a produção e consulte o saldo.', icon: '📦', route: '/estoque' },
    { label: '6. Vendas', description: 'Comercialize os produtos disponíveis.', icon: '💰', route: '/vendas' },
  ];
}
