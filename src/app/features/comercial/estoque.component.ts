import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProdutoService } from '../../core/cadastros/cadastros.services';
import { Produto } from '../../core/models/cadastros.model';
import { NotificationService } from '../../core/notifications/notification.service';
interface Movimento {idMovimentacao:number;nomeProduto:string;tipo:string;quantidade:number;saldoAnterior:number;saldoPosterior:number;dataMovimentacao:string;origem:string;}
@Component({selector:'app-estoque',imports:[ReactiveFormsModule],template:`
<div class="page-header"><div><h1>Movimentações de estoque</h1><p>Registre entradas e saídas de produtos com histórico de saldo.</p></div></div>
<form class="card" [formGroup]="form" (ngSubmit)="salvar()">
<div class="form-grid">
<label>Operação *<select formControlName="operacao"><option value="entrada">Entrada</option><option value="saida">Saída / descarte</option></select></label>
<label>Produto *<select formControlName="idProduto"><option [ngValue]="null">Selecione</option>@for(p of produtos();track p.idProduto){<option [ngValue]="p.idProduto">{{p.nome}} — disponível: {{p.quantidadeEstoque}} {{p.unidadeMedida}}</option>}</select></label>
<label>Quantidade *<input type="number" formControlName="quantidade" min="0.001" step="0.001"></label>
<label>Motivo / origem<input formControlName="motivo" maxlength="100"></label>
<label>Observações<input formControlName="observacoes" maxlength="500"></label>
</div><div class="form-actions"><button [disabled]="saving()" type="submit" class="btn btn--primary">Registrar movimentação</button></div>
</form>
@if(error()){<div class="card">Falha ao consultar estoque. <button class="btn btn--outline" (click)="carregar()">Tentar novamente</button></div>}
<div class="table-wrap" style="margin-top:1rem"><table class="table"><thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Quantidade</th><th>Saldo anterior</th><th>Saldo posterior</th><th>Origem</th></tr></thead><tbody>
@for(m of movimentos();track m.idMovimentacao){<tr><td>{{m.dataMovimentacao}}</td><td>{{m.nomeProduto}}</td><td>{{m.tipo}}</td><td>{{m.quantidade}}</td><td>{{m.saldoAnterior}}</td><td>{{m.saldoPosterior}}</td><td>{{m.origem}}</td></tr>}
@empty{<tr><td colspan="7">Nenhuma movimentação registrada.</td></tr>}</tbody></table></div>
`})
export class EstoqueComponent implements OnInit {
 private readonly http=inject(HttpClient);private readonly produtosApi=inject(ProdutoService);
 private readonly fb=inject(FormBuilder).nonNullable;private readonly notify=inject(NotificationService);
 readonly produtos=signal<Produto[]>([]);readonly movimentos=signal<Movimento[]>([]);readonly saving=signal(false);readonly error=signal(false);
 readonly form=this.fb.group({operacao:['entrada',Validators.required],idProduto:[null as number|null,Validators.required],quantidade:[null as number|null,[Validators.required,Validators.min(0.001)]],motivo:[''],observacoes:['']});
 ngOnInit(){this.carregar();}
 carregar(){forkJoin({produtos:this.produtosApi.list(),movimentos:this.http.get<Movimento[]>(environment.apiUrl+'/estoque')}).subscribe({next:r=>{this.produtos.set(r.produtos);this.movimentos.set(r.movimentos);this.error.set(false);},error:()=>this.error.set(true)});}
 salvar(){if(this.form.invalid){this.form.markAllAsTouched();this.notify.error('Preencha os campos obrigatórios.');return;}const v=this.form.getRawValue();const entrada=v.operacao==='entrada';const url=environment.apiUrl+'/estoque/'+(entrada?'entrada':'saida');
 const dados=entrada?{idProduto:v.idProduto,quantidade:v.quantidade,tipo:'ENTRADA_AVULSA',origem:v.motivo||'Entrada manual',observacoes:v.observacoes}:{idProduto:v.idProduto,quantidade:v.quantidade,tipo:'SAIDA_AVULSA',motivo:v.motivo||'Saída manual',observacoes:v.observacoes};
 this.saving.set(true);this.http.post(url,dados).subscribe({next:()=>{this.saving.set(false);this.form.reset({operacao:'entrada'});this.notify.success('Movimentação registrada.');this.carregar();},error:()=>this.saving.set(false)});}
}
