import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
interface ResumoFinanceiro {
 receitaTotalVendas: number; totalVendasRealizadas: number; custoTotalInsumos: number;
 custoTotalGastos: number; custoTotalPerdas: number; despesasTotais: number;
 saldoLiquido: number; margemLucroPercentual: number;
}
@Component({
 selector: 'app-financeiro',
 template: `
 <div class="page-header"><div><h1>Resumo financeiro</h1><p>Indicadores calculados automaticamente a partir das movimentações registradas.</p></div></div>
 @if(erro()){<div class="card">Não foi possível carregar o resumo. <button class="btn btn--outline" (click)="carregar()">Tentar novamente</button></div>}
 @if(resumo();as r){
 <div class="finance-grid">
 <div class="card"><span>Receita de vendas</span><h2>{{moeda(r.receitaTotalVendas)}}</h2></div>
 <div class="card"><span>Despesas operacionais</span><h2>{{moeda(r.despesasTotais)}}</h2></div>
 <div class="card"><span>Saldo operacional estimado</span><h2>{{moeda(r.saldoLiquido)}}</h2></div>
 <div class="card"><span>Margem operacional</span><h2>{{r.margemLucroPercentual}}%</h2></div>
 <div class="card"><span>Perdas registradas (estimadas)</span><h2>{{moeda(r.custoTotalPerdas)}}</h2></div>
 <div class="card"><span>Saldo projetado após perdas*</span><h2>{{moeda(r.saldoLiquido - r.custoTotalPerdas)}}</h2></div>
 </div>
 <div class="table-wrap" style="margin-top:1rem"><table class="table"><tbody>
 <tr><th>Vendas concluídas</th><td>{{r.totalVendasRealizadas}}</td></tr>
 <tr><th>Custo de insumos aplicados</th><td>{{moeda(r.custoTotalInsumos)}}</td></tr>
 <tr><th>Gastos de produção</th><td>{{moeda(r.custoTotalGastos)}}</td></tr>
 <tr><th>Perdas estimadas (informativas)</th><td>{{moeda(r.custoTotalPerdas)}}</td></tr>
 </tbody></table></div>
 <p>*Projeção informativa: considera as perdas estimadas como impacto adicional. O saldo operacional não desconta perdas novamente, porque podem representar valores já incluídos nos custos de produção. Não trate a projeção como lucro contábil.</p>
 }
 `,
 styles:[`.finance-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1rem}.finance-grid h2{color:var(--color-primary-dark);margin-bottom:0}`]
})
export class FinanceiroComponent implements OnInit {
 private readonly http=inject(HttpClient);
 readonly resumo=signal<ResumoFinanceiro|null>(null);readonly erro=signal(false);
 ngOnInit(){this.carregar();}
 carregar(){this.http.get<ResumoFinanceiro>(environment.apiUrl+'/financeiro/resumo').subscribe({next:r=>{this.resumo.set(r);this.erro.set(false);},error:()=>this.erro.set(true)});}
 moeda(valor:number){return Number(valor||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
}
