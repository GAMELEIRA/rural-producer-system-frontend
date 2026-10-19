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
@Component({selector:'app-perdas', imports:[ReactiveFormsModule],template:`
<div class="page-header"><div><h1>Perdas agrícolas</h1><p>Registre e acompanhe os lançamentos vinculados aos cultivos.</p></div></div>
<form class="card" [formGroup]="form" (ngSubmit)="salvar()"><div class="form-grid"><label>Plantação *<select formControlName="idPlantacao"><option [ngValue]="null">Selecione</option>@for(p of plantacoes();track p.idPlantacao){<option [ngValue]="p.idPlantacao">{{p.nomeCultura}} - {{p.nomeTalhao}}</option>}</select></label>
<label>Data da perda *<input type="date"  formControlName="dataPerda"></label>
<label>Quantidade perdida *<input type="number" step="0.01" min="0" formControlName="quantidade"></label>
<label>Motivo *<input type="text"  formControlName="motivo"></label>
<label>Prejuízo estimado (R$)<input type="number" step="0.01" min="0" formControlName="valorEstimado"></label>
<label>Observações<input type="text"  formControlName="observacoes"></label></div>
<div class="form-actions"><button class="btn btn--primary" type="submit" [disabled]="saving()">Registrar</button></div></form>
@if(error()){<div class="card">Não foi possível carregar os dados. <button class="btn btn--outline" (click)="carregar()">Tentar novamente</button></div>}
<div class="rural-cards">
@for(item of registros();track item['idPerda']){<article class="card rural-entry">
<button type="button" class="rural-entry__trigger" (click)="detalhe.set(detalhe()===item['idPerda']?null:item['idPerda'])">
<strong>{{item['motivo']}}</strong><span>{{item['nomeCultura']||'Plantação #'+item['idPlantacao']}} · {{item['dataPerda']}}</span><strong>{{item['quantidade']}} perdidos</strong><span>Prejuízo: {{moeda(item['valorEstimado'])}}</span><span>Ver detalhes {{detalhe()===item['idPerda']?'▲':'▼'}}</span>
</button>
@if(detalhe()===item['idPerda']){<div class="rural-entry__detail"><p>Registro #{{item['idPerda']}} · Talhão: {{item['nomeTalhao']||'—'}}</p><p>{{item['observacoes']||'Sem observações adicionais'}}</p><button class="btn btn--danger btn--sm" (click)="excluir(item)">Excluir perda</button></div>}
</article>}@empty{<div class="card">Nenhuma perda registrada.</div>}
</div>
`})
export class PerdasComponent implements OnInit {
 private readonly http=inject(HttpClient);private readonly api=inject(ProducaoService);private readonly insumosApi=inject(InsumoService);
 private readonly fb=inject(FormBuilder).nonNullable;private readonly notify=inject(NotificationService);private readonly confirm=inject(ConfirmService);
 readonly registros=signal<Record<string,any>[]>([]);readonly plantacoes=signal<Plantacao[]>([]);readonly insumos=signal<Insumo[]>([]);
 readonly detalhe=signal<number|null>(null);readonly saving=signal(false);readonly error=signal(false);readonly campos=["idPlantacao","dataPerda","quantidade","motivo","valorEstimado","observacoes"];
 readonly form=this.fb.group({idPlantacao:[null as number|null,[Validators.required]],dataPerda:['',[Validators.required]],quantidade:[null as number|null,[Validators.required,Validators.min(0.01)]],motivo:['',[Validators.required]],valorEstimado:[null as number|null,[]],observacoes:['',[]]});
 private readonly endpoint=environment.apiUrl+'/perdas';
 moeda(n:number){return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
 ngOnInit(){this.carregar();}
 carregar(){forkJoin({registros:this.http.get<Record<string,any>[]>(this.endpoint),plantacoes:this.api.listarPlantacoes(),insumos:this.insumosApi.list()}).subscribe({next:r=>{this.registros.set(r.registros);this.plantacoes.set(r.plantacoes);this.insumos.set(r.insumos);this.error.set(false);},error:()=>this.error.set(true)});}
 salvar(){if(this.form.invalid){this.form.markAllAsTouched();this.notify.error('Preencha os campos obrigatórios.');return;}this.saving.set(true);this.http.post(this.endpoint,this.form.getRawValue()).subscribe({next:()=>{this.saving.set(false);this.form.reset();this.notify.success('Registro cadastrado.');this.carregar();},error:()=>this.saving.set(false)});}
 async excluir(item:Record<string,any>){if(!await this.confirm.ask({title:'Excluir registro',message:'Excluir o registro selecionado?',confirmLabel:'Excluir',danger:true}))return;this.http.delete(this.endpoint+'/'+item['idPerda']).subscribe(()=>{this.notify.success('Registro excluído.');this.carregar();});}
}
