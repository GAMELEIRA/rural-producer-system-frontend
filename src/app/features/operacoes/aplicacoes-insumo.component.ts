import { Component, inject, OnInit, signal } from '@angular/core';
import { AppModalComponent } from '../../shared/components/app-modal/app-modal.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProducaoService, Plantacao } from '../producao/producao.service';
import { InsumoService } from '../../core/cadastros/cadastros.services';
import { Insumo } from '../../core/models/cadastros.model';
import { NotificationService } from '../../core/notifications/notification.service';
import { ConfirmService } from '../../core/notifications/confirm.service';
@Component({selector:'app-aplicacoes-insumo', imports:[ReactiveFormsModule,AppModalComponent],template:`
<div class="page-header"><div><h1>Aplicações de insumo</h1><p>Registre e acompanhe os lançamentos vinculados aos cultivos.</p></div></div>
<form class="card" [formGroup]="form" (ngSubmit)="salvar()"><div class="form-grid"><label>Plantação *<select formControlName="idPlantacao"><option [ngValue]="null">Selecione</option>@for(p of plantacoes();track p.idPlantacao){<option [ngValue]="p.idPlantacao">{{p.nomeCultura}} - {{p.nomeTalhao}}</option>}</select></label>
<label>Insumo *<select formControlName="idInsumo"><option [ngValue]="null">Selecione</option>@for(i of insumos();track i.idInsumo){<option [ngValue]="i.idInsumo">{{i.nome}} ({{i.quantidadeEstoque}} {{i.unidadeMedida}})</option>}</select></label>
<label>Data da aplicação *<input type="date"  formControlName="dataAplicacao"></label>
<label>Quantidade aplicada *<input type="number" step="0.001" min="0.001" [max]="saldoDisponivel()" formControlName="quantidade"><small>Disponível: {{saldoDisponivel()}} {{unidadeSelecionada()}} | Custo previsto: {{custoPrevisto().toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}}</small></label>
<label>Observações<input type="text"  formControlName="observacoes"></label></div>
<div class="form-actions"><button class="btn btn--primary" type="submit" [disabled]="saving()">Registrar</button></div></form>
@if(error()){<div class="card">Não foi possível carregar os dados. <button class="btn btn--outline" (click)="carregar()">Tentar novamente</button></div>}
<div class="rural-cards">
@for(item of registros();track item['idAplicacao']) {
 <article class="card rural-entry"><button type="button" class="rural-entry__trigger" (click)="detalhe.set(detalhe()===item['idAplicacao']?null:item['idAplicacao'])">
 <strong>{{nomeInsumo(item['idInsumo'])}}</strong><span>{{nomePlantacao(item['idPlantacao'])}}</span><span>{{item['dataAplicacao']}} · {{item['quantidade']}} {{unidade(item['idInsumo'])}}</span><strong>{{moeda(item['custoTotal'])}}</strong><span>Ver detalhes</span></button>
 @if(detalhe()===item['idAplicacao']){<app-modal titulo="Aplicação de insumo" (fechado)="detalhe.set(null)"><p>Aplicação nº {{item['idAplicacao']}}</p><p>Insumo: {{nomeInsumo(item['idInsumo'])}}</p><p>Plantação: {{nomePlantacao(item['idPlantacao'])}}</p><p>Observações: {{item['observacoes']||'—'}}</p><button class="btn btn--danger btn--sm" (click)="excluir(item)">Excluir aplicação e estornar insumo</button></app-modal>}
 </article>
} @empty {<div class="card">Nenhuma aplicação registrada.</div>}
</div>
`})
export class AplicacoesInsumoComponent implements OnInit {
 private readonly http=inject(HttpClient);private readonly api=inject(ProducaoService);private readonly insumosApi=inject(InsumoService);
 private readonly fb=inject(FormBuilder).nonNullable;private readonly notify=inject(NotificationService);private readonly confirm=inject(ConfirmService);
 readonly registros=signal<Record<string,any>[]>([]);readonly plantacoes=signal<Plantacao[]>([]);readonly insumos=signal<Insumo[]>([]);
 readonly detalhe=signal<number|null>(null);
 readonly saving=signal(false);readonly error=signal(false);readonly campos=["idPlantacao","idInsumo","dataAplicacao","quantidade","observacoes"];
 readonly form=this.fb.group({idPlantacao:[null as number|null,[Validators.required]],idInsumo:[null as number|null,[Validators.required]],dataAplicacao:['',[Validators.required]],quantidade:[null as number|null,[Validators.required,Validators.min(0.01)]],observacoes:['',[]]});
 private readonly endpoint=environment.apiUrl+'/aplicacoes-insumo';
 ngOnInit(){this.form.controls.idInsumo.valueChanges.subscribe(id=>{const insumo=this.insumos().find(i=>i.idInsumo===id);this.form.controls.quantidade.setValue(insumo?.quantidadeEstoque??null);});this.carregar();}
 saldoDisponivel(){return this.insumos().find(i=>i.idInsumo===this.form.controls.idInsumo.value)?.quantidadeEstoque??0;}
 unidadeSelecionada(){return this.unidade(this.form.controls.idInsumo.value);}
 unidade(id:number|null){return this.insumos().find(i=>i.idInsumo===id)?.unidadeMedida??'';}
 nomeInsumo(id:number){return this.insumos().find(i=>i.idInsumo===id)?.nome??'Insumo #'+id;}
 nomePlantacao(id:number){const p=this.plantacoes().find(x=>x.idPlantacao===id);return p?p.nomeCultura+' · '+p.nomeTalhao:'Plantação #'+id;}
 moeda(v:number){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
 custoPrevisto(){const p=this.insumos().find(i=>i.idInsumo===this.form.controls.idInsumo.value);return Number(this.form.controls.quantidade.value||0)*Number(p?.precoUnitario||0);}

 carregar(){forkJoin({registros:this.http.get<Record<string,any>[]>(this.endpoint),plantacoes:this.api.listarPlantacoes(),insumos:this.insumosApi.list()}).subscribe({next:r=>{this.registros.set(r.registros);this.plantacoes.set(r.plantacoes);this.insumos.set(r.insumos);this.error.set(false);},error:()=>this.error.set(true)});}
 salvar(){if(this.form.invalid){this.form.markAllAsTouched();this.notify.error('Preencha os campos obrigatórios.');return;}if(Number(this.form.controls.quantidade.value)>this.saldoDisponivel()){this.notify.error('Quantidade superior ao saldo disponível.');return;}this.saving.set(true);this.http.post(this.endpoint,this.form.getRawValue()).subscribe({next:()=>{this.saving.set(false);this.form.reset();this.notify.success('Registro cadastrado.');this.carregar();},error:()=>this.saving.set(false)});}
 async excluir(item:Record<string,any>){if(!await this.confirm.ask({title:'Excluir registro',message:'Excluir o registro selecionado?',confirmLabel:'Excluir',danger:true}))return;this.http.delete(this.endpoint+'/'+item['idAplicacao']).subscribe(()=>{this.notify.success('Registro excluído.');this.carregar();});}
}
