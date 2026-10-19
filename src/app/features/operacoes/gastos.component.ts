import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProducaoService, Plantacao } from '../producao/producao.service';
import { InsumoService } from '../../core/cadastros/cadastros.services';
import { Insumo } from '../../core/models/cadastros.model';
import { NotificationService } from '../../core/notifications/notification.service';
import { ConfirmService } from '../../core/notifications/confirm.service';
@Component({selector:'app-gastos', imports:[ReactiveFormsModule],template:`
<div class="page-header"><div><h1>Custos da produção</h1><p>Aplicações de insumos são lançadas automaticamente como custos. Cadastre aqui somente despesas adicionais.</p></div></div>
<form class="card" [formGroup]="form" (ngSubmit)="salvar()"><div class="form-grid"><label>Plantação *<select formControlName="idPlantacao"><option [ngValue]="null">Selecione</option>@for(p of plantacoes();track p.idPlantacao){<option [ngValue]="p.idPlantacao">{{p.nomeCultura}} - {{p.nomeTalhao}}</option>}</select></label>
<label>Descrição *<input type="text"  formControlName="descricao"></label>
<label>Valor (R$) *<input type="number" step="0.01" min="0" formControlName="valor"></label>
<label>Data *<input type="date"  formControlName="dataGasto"></label>
<label>Categoria<input type="text"  formControlName="categoria"></label>
<label>Observações<input type="text"  formControlName="observacoes"></label></div>
<div class="form-actions"><button class="btn btn--primary" type="submit" [disabled]="saving()">Registrar</button></div></form>
@if(error()){<div class="card">Não foi possível carregar os dados. <button class="btn btn--outline" (click)="carregar()">Tentar novamente</button></div>}
<h2>Custos registrados</h2><div class="rural-cards">
@for(item of lancamentos();track item.chave){<article class="card rural-entry">
<button class="rural-entry__trigger" (click)="detalhe.set(detalhe()===item.chave?null:item.chave)" type="button">
<strong>{{item.titulo}}</strong><span>{{item.plantacao}} · {{item.data}}</span><strong>{{moeda(item.valor)}}</strong><span>{{item.automatico?'Custo automático de insumo':'Gasto adicional'}}</span>
</button>
@if(detalhe()===item.chave){<div class="rural-entry__detail"><p>Categoria: {{item.categoria}}</p><p>Plantação: {{item.plantacao}}</p><p>Registro de origem: {{item.chave}}</p>
@if(!item.automatico){<button class="btn btn--danger btn--sm" (click)="excluir(item.original!)">Excluir gasto</button>}
@else{<p>Gerenciado pela aplicação de insumos. Para corrigir, altere ou exclua a aplicação correspondente.</p>}
</div>}
</article>}
@empty{<div class="card">Nenhum custo de produção registrado.</div>}
</div>
`})
export class GastosComponent implements OnInit {
 private readonly http=inject(HttpClient);private readonly api=inject(ProducaoService);private readonly insumosApi=inject(InsumoService);
 private readonly fb=inject(FormBuilder).nonNullable;private readonly notify=inject(NotificationService);private readonly confirm=inject(ConfirmService);
 readonly registros=signal<Record<string,any>[]>([]);readonly plantacoes=signal<Plantacao[]>([]);readonly insumos=signal<Insumo[]>([]);
 readonly detalhe=signal<string|null>(null);
 readonly aplicacoes=signal<Record<string,any>[]>([]);
 readonly saving=signal(false);readonly error=signal(false);readonly campos=["idPlantacao","descricao","valor","dataGasto","categoria","observacoes"];
 readonly form=this.fb.group({idPlantacao:[null as number|null,[Validators.required]],descricao:['',[Validators.required]],valor:[null as number|null,[Validators.required,Validators.min(0.01)]],dataGasto:['',[Validators.required]],categoria:['',[]],observacoes:['',[]]});
 private readonly endpoint=environment.apiUrl+'/gastos';
 ngOnInit(){this.carregar();}
 moeda(valor:number){return Number(valor||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
 lancamentos(){const gastos=this.registros().map(g=>({chave:'G'+g['idGasto'],titulo:String(g['descricao']),data:String(g['dataGasto']),valor:Number(g['valor']),plantacao:String(g['nomeCultura']||'Plantação #'+g['idPlantacao']),categoria:String(g['categoria']||'OUTROS'),automatico:false,original:g}));
 const insumos=this.aplicacoes().map(a=>({chave:'I'+a['idAplicacao'],titulo:'Insumo: '+String(a['nomeInsumo']||a['idInsumo']),data:String(a['dataAplicacao']),valor:Number(a['custoTotal']),plantacao:String(a['nomeCultura']||'Plantação #'+a['idPlantacao']),categoria:'INSUMOS_AGRICOLAS',automatico:true,original:null}));
 return [...gastos,...insumos].sort((a,b)=>b.data.localeCompare(a.data));}

 carregar(){forkJoin({registros:this.http.get<Record<string,any>[]>(this.endpoint),plantacoes:this.api.listarPlantacoes(),insumos:this.insumosApi.list(),aplicacoes:this.http.get<Record<string,any>[]>(environment.apiUrl+'/aplicacoes-insumo')}).subscribe({next:r=>{this.registros.set(r.registros);this.plantacoes.set(r.plantacoes);this.insumos.set(r.insumos);this.aplicacoes.set(r.aplicacoes);this.error.set(false);},error:()=>this.error.set(true)});}
 salvar(){if(this.form.invalid){this.form.markAllAsTouched();this.notify.error('Preencha os campos obrigatórios.');return;}this.saving.set(true);this.http.post(this.endpoint,this.form.getRawValue()).subscribe({next:()=>{this.saving.set(false);this.form.reset();this.notify.success('Registro cadastrado.');this.carregar();},error:()=>this.saving.set(false)});}
 async excluir(item:Record<string,any>){if(!await this.confirm.ask({title:'Excluir registro',message:'Excluir o registro selecionado?',confirmLabel:'Excluir',danger:true}))return;this.http.delete(this.endpoint+'/'+item['idGasto']).subscribe(()=>{this.notify.success('Registro excluído.');this.carregar();});}
}
