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
<div class="page-header"><div><h1>Gastos de produção</h1><p>Registre e acompanhe os lançamentos vinculados aos cultivos.</p></div></div>
<form class="card" [formGroup]="form" (ngSubmit)="salvar()"><div class="form-grid"><label>Plantação *<select formControlName="idPlantacao"><option [ngValue]="null">Selecione</option>@for(p of plantacoes();track p.idPlantacao){<option [ngValue]="p.idPlantacao">{{p.nomeCultura}} - {{p.nomeTalhao}}</option>}</select></label>
<label>Descrição *<input type="text"  formControlName="descricao"></label>
<label>Valor (R$) *<input type="number" step="0.01" min="0" formControlName="valor"></label>
<label>Data *<input type="date"  formControlName="dataGasto"></label>
<label>Categoria<input type="text"  formControlName="categoria"></label>
<label>Observações<input type="text"  formControlName="observacoes"></label></div>
<div class="form-actions"><button class="btn btn--primary" type="submit" [disabled]="saving()">Registrar</button></div></form>
@if(error()){<div class="card">Não foi possível carregar os dados. <button class="btn btn--outline" (click)="carregar()">Tentar novamente</button></div>}
<div class="table-wrap" style="margin-top:1rem"><table class="table"><thead><tr><th>Registro</th><th>Dados</th><th>Ações</th></tr></thead><tbody>
@for(item of registros();track item['idGasto']){<tr><td>#{{item['idGasto']}}</td><td class="table__muted">@for(campo of campos;track campo){<div><strong>{{campo}}:</strong> {{item[campo] ?? '—'}}</div>}</td><td><button class="btn btn--danger btn--sm" (click)="excluir(item)">Excluir</button></td></tr>}
@empty{<tr><td colspan="3">Nenhum registro encontrado.</td></tr>}</tbody></table></div>
`})
export class GastosComponent implements OnInit {
 private readonly http=inject(HttpClient);private readonly api=inject(ProducaoService);private readonly insumosApi=inject(InsumoService);
 private readonly fb=inject(FormBuilder).nonNullable;private readonly notify=inject(NotificationService);private readonly confirm=inject(ConfirmService);
 readonly registros=signal<Record<string,any>[]>([]);readonly plantacoes=signal<Plantacao[]>([]);readonly insumos=signal<Insumo[]>([]);
 readonly saving=signal(false);readonly error=signal(false);readonly campos=["idPlantacao","descricao","valor","dataGasto","categoria","observacoes"];
 readonly form=this.fb.group({idPlantacao:[null as number|null,[Validators.required]],descricao:['',[Validators.required]],valor:[null as number|null,[Validators.required,Validators.min(0.01)]],dataGasto:['',[Validators.required]],categoria:['',[]],observacoes:['',[]]});
 private readonly endpoint=environment.apiUrl+'/gastos';
 ngOnInit(){this.carregar();}
 carregar(){forkJoin({registros:this.http.get<Record<string,any>[]>(this.endpoint),plantacoes:this.api.listarPlantacoes(),insumos:this.insumosApi.list()}).subscribe({next:r=>{this.registros.set(r.registros);this.plantacoes.set(r.plantacoes);this.insumos.set(r.insumos);this.error.set(false);},error:()=>this.error.set(true)});}
 salvar(){if(this.form.invalid){this.form.markAllAsTouched();this.notify.error('Preencha os campos obrigatórios.');return;}this.saving.set(true);this.http.post(this.endpoint,this.form.getRawValue()).subscribe({next:()=>{this.saving.set(false);this.form.reset();this.notify.success('Registro cadastrado.');this.carregar();},error:()=>this.saving.set(false)});}
 async excluir(item:Record<string,any>){if(!await this.confirm.ask({title:'Excluir registro',message:'Excluir o registro selecionado?',confirmLabel:'Excluir',danger:true}))return;this.http.delete(this.endpoint+'/'+item['idGasto']).subscribe(()=>{this.notify.success('Registro excluído.');this.carregar();});}
}
