import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppModalComponent } from '../../shared/components/app-modal/app-modal.component';
import { CulturaService, TalhaoService, ProdutoService } from '../../core/cadastros/cadastros.services';
import { Cultura, Talhao, Produto, UNIDADES_MEDIDA } from '../../core/models/cadastros.model';
import { ProducaoService, Plantacao, Safra } from './producao.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { ConfirmService } from '../../core/notifications/confirm.service';
@Component({
 selector:'app-plantacoes', imports:[ReactiveFormsModule,RouterLink,AppModalComponent],
 template:`
 <div class="page-header"><div><h1>Plantações</h1><p>Registre plantios e finalize as colheitas.</p></div></div>
 @if(safras().length===0){<div class="card"><h2>1. Comece cadastrando uma safra</h2><p>Antes de iniciar o plantio, organize o período de produção.</p><a class="btn btn--primary" routerLink="/safras">Cadastrar safra</a></div>}
@else {<div class="card" style="margin-bottom:1rem"><strong>Etapa 2 de 5: Planeje o plantio</strong><p>Depois você poderá aplicar insumos, registrar a colheita e vender a produção.</p></div>}
<form class="card" [formGroup]="form" (ngSubmit)="salvar()">
  <div class="form-grid">
   <label>Safra * <a routerLink="/safras">+ Criar safra</a><select formControlName="idSafra"><option [ngValue]="null">Selecione</option>@for(s of safras();track s.idSafra){@if(s.status!=='FINALIZADA'){<option [ngValue]="s.idSafra">{{s.nome}}</option>}}</select></label>
   <label>Talhão *<select formControlName="idTalhao"><option [ngValue]="null">Selecione</option>@for(t of talhoes();track t.idTalhao){<option [ngValue]="t.idTalhao">{{t.nome}}</option>}</select></label>
   <label>Cultura *<select formControlName="idCultura"><option [ngValue]="null">Selecione</option>@for(c of culturas();track c.idCultura){<option [ngValue]="c.idCultura">{{c.nome}}</option>}</select></label>
   <label>Data de plantio *<input type="date" formControlName="dataPlantio"></label>
   @if(previsaoColheita()){<p class="form-grid__full">Previsão de colheita com base no ciclo da cultura: <strong>{{previsaoColheita()}}</strong>. É uma estimativa, não uma data obrigatória.</p>}
   <label>Quantidade plantada *<input type="number" min="0.01" step="0.01" formControlName="quantidadePlantada"></label>
   <label>Observações<input formControlName="observacoes"></label>
  </div>
  <div class="form-actions"><button type="submit" [disabled]="saving()" class="btn btn--primary">Cadastrar plantação</button></div>
 </form>
 @if(carregando()){<p role="status">Carregando plantações e perdas...</p>}
 @if(error()){<p class="table__warn">Falha ao carregar dados. <button (click)="carregar()" class="btn btn--outline">Tentar novamente</button></p>}
 <div class="table-wrap" style="margin-top:1.25rem"><table class="table"><thead><tr><th>Safra</th><th>Cultura</th><th>Talhão</th><th>Plantio</th><th>Plantada</th><th>Colhida líquida</th><th>Perdas</th><th>Status</th><th>Ações</th></tr></thead>
 <tbody>@for(p of plantacoes();track p.idPlantacao){<tr><td>{{p.nomeSafra || '—'}}</td><td>{{p.nomeCultura}}</td><td>{{p.nomeTalhao}}</td><td>{{p.dataPlantio}}</td><td>{{p.quantidadePlantada}}</td><td>{{p.quantidadeColhida ?? '—'}}</td><td>{{totalPerdas(p.idPlantacao)}}</td><td>{{p.status}}</td>
 <td class="table__actions">@if(p.status!=='COLHIDA'&&p.status!=='COLHIDO'){<button class="btn btn--outline btn--sm" (click)="colher(p)">Registrar colheita</button>}<button class="btn btn--danger btn--sm" (click)="excluir(p)">Excluir</button></td></tr>
 } @empty {<tr><td colspan="9">Nenhuma plantação cadastrada.</td></tr>}</tbody></table></div>
 @if(colheitaId() !== null){
 <app-modal [titulo]="'Finalizar colheita #'+colheitaId()" (fechado)="colheitaId.set(null)">
 <form [formGroup]="colheitaForm" (ngSubmit)="finalizarColheita()">
  <p>Informe a quantidade bruta colhida e o que foi descartado durante a colheita. Somente a quantidade líquida entra no estoque.</p><div class="form-grid">
  <label>Data da colheita *<input type="date" formControlName="dataColheita" [min]="colheitaMin()" [max]="colheitaMax()"></label>
  <p class="form-grid__full">Período permitido: {{colheitaMin()}} até {{colheitaMax()}}. A data deve respeitar a safra e o plantio.</p>
  <label class="form-grid__full"><input type="checkbox" formControlName="criarProduto"> Criar um produto a partir desta cultura durante a colheita (opcional)</label>
  @if (!colheitaForm.controls.criarProduto.value) {
  <label>Produto de destino *<select formControlName="idProduto"><option [ngValue]="null">Selecione</option>@for(produto of produtos();track produto.idProduto){<option [ngValue]="produto.idProduto">{{produto.nome}} ({{produto.unidadeMedida}}) {{produto.nome.toLowerCase().includes(nomeCulturaColheita().toLowerCase())?"— sugerido":""}}</option>}</select></label>
  } @else {
    <p class="form-grid__full">O produto <strong>{{nomeCulturaColheita()}}</strong> será criado automaticamente com o estoque inicial zerado e receberá a quantidade colhida.</p>
    <label>Unidade do novo produto *<select formControlName="unidadeNovoProduto">@for(u of unidades;track u){<option [value]="u">{{u}}</option>}</select></label>
    <label>Preço de venda por unidade (R$) *<input type="number" min="0" step="0.01" formControlName="precoVendaNovoProduto"></label>
  }
  <label>Quantidade colhida bruta *<input type="number" min="0" step="0.01" formControlName="quantidadeColhida"></label>
  <label>Perda nesta colheita<input type="number" min="0" step="0.01" formControlName="quantidadePerdidaColheita"></label>
  <p class="form-grid__full"><strong>Entrada líquida prevista no estoque: {{quantidadeLiquida()}}</strong></p>
  <p class="form-grid__full">Perdas anteriores no campo: {{perdasCampo(colheitaId()!)}}. Essas perdas não entram no estoque e não devem ser descontadas novamente da colheita efetivamente realizada.</p></div>
  <div class="form-actions"><button type="button" (click)="colheitaId.set(null)" class="btn btn--ghost">Cancelar</button><button class="btn btn--primary" [disabled]="saving()" type="submit">Confirmar colheita</button></div>
 </form></app-modal>}
 `
})
export class PlantacoesComponent implements OnInit {
 private readonly api=inject(ProducaoService);
 private readonly http=inject(HttpClient);
 private readonly culturasApi=inject(CulturaService);
 private readonly talhoesApi=inject(TalhaoService);
 private readonly produtosApi=inject(ProdutoService);
 private readonly notify=inject(NotificationService);
 private readonly confirm=inject(ConfirmService);
 private readonly fb=inject(FormBuilder).nonNullable;
 readonly unidades = UNIDADES_MEDIDA;
 readonly produtos=signal<Produto[]>([]);readonly culturas=signal<Cultura[]>([]);readonly talhoes=signal<Talhao[]>([]);readonly safras=signal<Safra[]>([]);readonly plantacoes=signal<Plantacao[]>([]);
 readonly previsaoColheita=signal<string>('');
 nomeCulturaColheita(){return this.plantacoes().find(p=>p.idPlantacao===this.colheitaId())?.nomeCultura||'';}
 readonly error=signal(false);readonly saving=signal(false);readonly carregando=signal(false);readonly colheitaId=signal<number|null>(null);
 readonly perdas=signal<{idPlantacao:number;quantidade:number;etapa?:string}[]>([]);
 totalPerdas(id:number){return this.perdas().filter(p=>p.idPlantacao===id).reduce((s,p)=>s+Number(p.quantidade),0);}
 perdasCampo(id:number){return this.perdas().filter(p=>p.idPlantacao===id&&(!p.etapa||p.etapa==='EM_CAMPO')).reduce((s,p)=>s+Number(p.quantidade),0);}
 quantidadeLiquida(){const colhida=Number(this.colheitaForm.controls.quantidadeColhida.value||0);const perda=Number(this.colheitaForm.controls.quantidadePerdidaColheita.value||0);return Math.max(0,colhida-perda);}
 readonly form=this.fb.group({idSafra:[null as number|null,Validators.required],idTalhao:[null as number|null,Validators.required],idCultura:[null as number|null,Validators.required],dataPlantio:['',Validators.required],quantidadePlantada:[null as number|null,[Validators.required,Validators.min(0.01)]],observacoes:['']});
 readonly colheitaForm=this.fb.group({idProduto:[null as number|null],criarProduto:[false],unidadeNovoProduto:['kg'],precoVendaNovoProduto:[0,[Validators.min(0)]],dataColheita:['',Validators.required],quantidadeColhida:[null as number|null,[Validators.required,Validators.min(0)]],quantidadePerdidaColheita:[0,[Validators.min(0)]]});
 ngOnInit(){this.form.controls.idCultura.valueChanges.subscribe(()=>this.calcularPrevisao());this.form.controls.dataPlantio.valueChanges.subscribe(()=>this.calcularPrevisao());this.carregar();}
 calcularPrevisao(){const cultura=this.culturas().find(c=>c.idCultura===this.form.controls.idCultura.value);const data=this.form.controls.dataPlantio.value;if(!cultura||!data){this.previsaoColheita.set('');return;}const inicio=new Date(data+'T12:00:00');const qtd=Number(cultura.cicloEstimado);switch(cultura.unidadeCiclo.toLowerCase()){case 'dias':inicio.setDate(inicio.getDate()+qtd);break;case 'semanas':inicio.setDate(inicio.getDate()+7*qtd);break;case 'meses':inicio.setMonth(inicio.getMonth()+qtd);break;default:this.previsaoColheita.set('');return;}this.previsaoColheita.set(inicio.toLocaleDateString('pt-BR'));}
 carregar(){this.carregando.set(true);forkJoin({s:this.api.listarSafras(),p:this.api.listarPlantacoes(),c:this.culturasApi.list(),t:this.talhoesApi.list(),produtos:this.produtosApi.list(),perdas:this.http.get<{idPlantacao:number;quantidade:number;etapa?:string}[]>(environment.apiUrl+'/perdas')}).subscribe({next:r=>{this.perdas.set(r.perdas);this.safras.set(r.s);this.plantacoes.set(r.p);this.culturas.set(r.c);this.calcularPrevisao();this.talhoes.set(r.t);this.produtos.set(r.produtos);this.error.set(false);this.carregando.set(false);},error:()=>{this.error.set(true);this.carregando.set(false);}});}
 salvar(){if(this.form.invalid){this.form.markAllAsTouched();return;}const v=this.form.getRawValue();this.saving.set(true);this.api.criarPlantacao({idSafra:v.idSafra!,idTalhao:v.idTalhao!,idCultura:v.idCultura!,dataPlantio:v.dataPlantio,quantidadePlantada:Number(v.quantidadePlantada),observacoes:v.observacoes}).subscribe({next:()=>{this.saving.set(false);this.form.reset();this.notify.success('Plantação cadastrada.');this.carregar();},error:()=>this.saving.set(false)});}
 colheitaMin(){const p=this.plantacoes().find(x=>x.idPlantacao===this.colheitaId());const safra=this.safras().find(s=>s.idSafra===p?.idSafra);return [p?.dataPlantio,safra?.dataInicio].filter((d):d is string=>!!d).sort().at(-1) || '';}
 colheitaMax(){const p=this.plantacoes().find(x=>x.idPlantacao===this.colheitaId());return this.safras().find(s=>s.idSafra===p?.idSafra)?.dataFim || '';}
 colher(p:Plantacao){this.colheitaId.set(p.idPlantacao);const sugestao=this.produtos().find(prod=>prod.idCultura===p.idCultura)||this.produtos().find(prod=>!prod.idCultura&&prod.nome.toLocaleLowerCase('pt-BR')===p.nomeCultura.toLocaleLowerCase('pt-BR'));const now=new Date();const hoje=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10);const data=hoje<this.colheitaMin()?this.colheitaMin():this.colheitaMax()&&hoje>this.colheitaMax()?this.colheitaMax():hoje;this.colheitaForm.patchValue({idProduto:sugestao?.idProduto??null,criarProduto:!sugestao,unidadeNovoProduto:'kg',precoVendaNovoProduto:0,dataColheita:data,quantidadeColhida:null,quantidadePerdidaColheita:0});}
 finalizarColheita(){const id=this.colheitaId();if(id===null||this.colheitaForm.invalid)return;const v=this.colheitaForm.getRawValue();if(Number(v.quantidadePerdidaColheita)>Number(v.quantidadeColhida)){this.notify.error('A perda na colheita não pode ser maior que a quantidade colhida.');return;}
 if(!v.criarProduto&&!v.idProduto){this.notify.error('Selecione o produto de destino ou marque a opção de criar um produto.');return;}
  if(v.dataColheita<this.colheitaMin()||(this.colheitaMax()&&v.dataColheita>this.colheitaMax())){this.notify.error('A data da colheita deve estar dentro do período da safra e após o plantio.');return;}
  this.saving.set(true);this.api.finalizarColheita(id,{dataColheita:v.dataColheita,quantidadeColhida:Number(v.quantidadeColhida),idProduto:v.criarProduto?null:v.idProduto,unidadeNovoProduto:v.criarProduto?v.unidadeNovoProduto:undefined,precoVendaNovoProduto:v.criarProduto?Number(v.precoVendaNovoProduto):undefined,quantidadePerdidaColheita:Number(v.quantidadePerdidaColheita||0)}).subscribe({next:()=>{this.saving.set(false);this.colheitaId.set(null);this.notify.success('Colheita registrada.');this.carregar();},error:()=>this.saving.set(false)});}
 async excluir(p:Plantacao){if(!await this.confirm.ask({title:'Excluir plantação e operações',message:'Excluir a plantação de '+p.nomeCultura+' e reverter suas aplicações de insumo, gastos, perdas e entradas de colheita? Se a produção já tiver sido consumida ou vendida, a exclusão será bloqueada para proteger o estoque.',confirmLabel:'Excluir plantação',danger:true}))return;this.saving.set(true);this.api.excluirPlantacao(p.idPlantacao).subscribe({next:()=>{this.saving.set(false);this.notify.success('Plantação e operações vinculadas excluídas.');this.carregar();},error:()=>this.saving.set(false)});}
}
