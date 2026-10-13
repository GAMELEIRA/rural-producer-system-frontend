import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CulturaService, TalhaoService, ProdutoService } from '../../core/cadastros/cadastros.services';
import { Cultura, Talhao, Produto } from '../../core/models/cadastros.model';
import { ProducaoService, Plantacao, Safra } from './producao.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { ConfirmService } from '../../core/notifications/confirm.service';
@Component({
 selector:'app-plantacoes', imports:[ReactiveFormsModule],
 template:`
 <div class="page-header"><div><h1>Plantações</h1><p>Registre plantios e finalize as colheitas.</p></div></div>
 <form class="card" [formGroup]="form" (ngSubmit)="salvar()">
  <div class="form-grid">
   <label>Safra *<select formControlName="idSafra"><option [ngValue]="null">Selecione</option>@for(s of safras();track s.idSafra){@if(s.status!=='FINALIZADA'){<option [ngValue]="s.idSafra">{{s.nome}}</option>}}</select></label>
   <label>Talhão *<select formControlName="idTalhao"><option [ngValue]="null">Selecione</option>@for(t of talhoes();track t.idTalhao){<option [ngValue]="t.idTalhao">{{t.nome}}</option>}</select></label>
   <label>Cultura *<select formControlName="idCultura"><option [ngValue]="null">Selecione</option>@for(c of culturas();track c.idCultura){<option [ngValue]="c.idCultura">{{c.nome}}</option>}</select></label>
   <label>Data de plantio *<input type="date" formControlName="dataPlantio"></label>
   <label>Quantidade plantada *<input type="number" min="0.01" step="0.01" formControlName="quantidadePlantada"></label>
   <label>Observações<input formControlName="observacoes"></label>
  </div>
  <div class="form-actions"><button type="submit" [disabled]="saving()" class="btn btn--primary">Cadastrar plantação</button></div>
 </form>
 @if(error()){<p class="table__warn">Falha ao carregar dados. <button (click)="carregar()" class="btn btn--outline">Tentar novamente</button></p>}
 <div class="table-wrap" style="margin-top:1.25rem"><table class="table"><thead><tr><th>Safra</th><th>Cultura</th><th>Talhão</th><th>Plantio</th><th>Plantada</th><th>Colhida</th><th>Status</th><th>Ações</th></tr></thead>
 <tbody>@for(p of plantacoes();track p.idPlantacao){<tr><td>{{p.nomeSafra || '—'}}</td><td>{{p.nomeCultura}}</td><td>{{p.nomeTalhao}}</td><td>{{p.dataPlantio}}</td><td>{{p.quantidadePlantada}}</td><td>{{p.quantidadeColhida ?? '—'}}</td><td>{{p.status}}</td>
 <td class="table__actions">@if(p.status!=='COLHIDA'&&p.status!=='COLHIDO'){<button class="btn btn--outline btn--sm" (click)="colher(p)">Registrar colheita</button>}<button class="btn btn--danger btn--sm" (click)="excluir(p)">Excluir</button></td></tr>
 } @empty {<tr><td colspan="8">Nenhuma plantação cadastrada.</td></tr>}</tbody></table></div>
 @if(colheitaId() !== null){
 <form class="card" [formGroup]="colheitaForm" (ngSubmit)="finalizarColheita()" style="margin-top:1rem">
  <h2>Finalizar colheita #{{colheitaId()}}</h2><div class="form-grid">
  <label>Data da colheita *<input type="date" formControlName="dataColheita"></label>
  <label>Produto de destino *<select formControlName="idProduto"><option [ngValue]="null">Selecione</option>@for(produto of produtos();track produto.idProduto){<option [ngValue]="produto.idProduto">{{produto.nome}} ({{produto.unidadeMedida}})</option>}</select></label>
  <label>Quantidade colhida *<input type="number" min="0" step="0.01" formControlName="quantidadeColhida"></label></div>
  <div class="form-actions"><button type="button" (click)="colheitaId.set(null)" class="btn btn--ghost">Cancelar</button><button class="btn btn--primary" [disabled]="saving()" type="submit">Confirmar colheita</button></div>
 </form>}
 `
})
export class PlantacoesComponent implements OnInit {
 private readonly api=inject(ProducaoService);
 private readonly culturasApi=inject(CulturaService);
 private readonly talhoesApi=inject(TalhaoService);
 private readonly produtosApi=inject(ProdutoService);
 private readonly notify=inject(NotificationService);
 private readonly confirm=inject(ConfirmService);
 private readonly fb=inject(FormBuilder).nonNullable;
 readonly produtos=signal<Produto[]>([]);readonly culturas=signal<Cultura[]>([]);readonly talhoes=signal<Talhao[]>([]);readonly safras=signal<Safra[]>([]);readonly plantacoes=signal<Plantacao[]>([]);
 readonly error=signal(false);readonly saving=signal(false);readonly colheitaId=signal<number|null>(null);
 readonly form=this.fb.group({idSafra:[null as number|null,Validators.required],idTalhao:[null as number|null,Validators.required],idCultura:[null as number|null,Validators.required],dataPlantio:['',Validators.required],quantidadePlantada:[null as number|null,[Validators.required,Validators.min(0.01)]],observacoes:['']});
 readonly colheitaForm=this.fb.group({idProduto:[null as number|null,Validators.required],dataColheita:['',Validators.required],quantidadeColhida:[null as number|null,[Validators.required,Validators.min(0)]]});
 ngOnInit(){this.carregar();}
 carregar(){forkJoin({s:this.api.listarSafras(),p:this.api.listarPlantacoes(),c:this.culturasApi.list(),t:this.talhoesApi.list(),produtos:this.produtosApi.list()}).subscribe({next:r=>{this.safras.set(r.s);this.plantacoes.set(r.p);this.culturas.set(r.c);this.talhoes.set(r.t);this.produtos.set(r.produtos);this.error.set(false);},error:()=>this.error.set(true)});}
 salvar(){if(this.form.invalid){this.form.markAllAsTouched();return;}const v=this.form.getRawValue();this.saving.set(true);this.api.criarPlantacao({idSafra:v.idSafra!,idTalhao:v.idTalhao!,idCultura:v.idCultura!,dataPlantio:v.dataPlantio,quantidadePlantada:Number(v.quantidadePlantada),observacoes:v.observacoes}).subscribe({next:()=>{this.saving.set(false);this.form.reset();this.notify.success('Plantação cadastrada.');this.carregar();},error:()=>this.saving.set(false)});}
 colher(p:Plantacao){this.colheitaId.set(p.idPlantacao);this.colheitaForm.patchValue({dataColheita:new Date().toISOString().slice(0,10),quantidadeColhida:null});}
 finalizarColheita(){const id=this.colheitaId();if(id===null||this.colheitaForm.invalid)return;const v=this.colheitaForm.getRawValue();this.saving.set(true);this.api.finalizarColheita(id,{dataColheita:v.dataColheita,quantidadeColhida:Number(v.quantidadeColhida),idProduto:v.idProduto!}).subscribe({next:()=>{this.saving.set(false);this.colheitaId.set(null);this.notify.success('Colheita registrada.');this.carregar();},error:()=>this.saving.set(false)});}
 async excluir(p:Plantacao){if(!await this.confirm.ask({title:'Excluir plantação',message:'Excluir plantação de '+p.nomeCultura+'?',confirmLabel:'Excluir',danger:true}))return;this.api.excluirPlantacao(p.idPlantacao).subscribe(()=>{this.notify.success('Plantação excluída.');this.carregar();});}
}
