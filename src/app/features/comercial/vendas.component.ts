import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProdutoService } from '../../core/cadastros/cadastros.services';
import { Produto } from '../../core/models/cadastros.model';
import { NotificationService } from '../../core/notifications/notification.service';
import { ConfirmService } from '../../core/notifications/confirm.service';
interface Venda {idVenda:number;cliente:string;dataVenda:string;valorTotal:number;status:string;formaPagamento:string;itens:{nomeProduto:string;quantidade:number;subtotal:number}[]}
@Component({selector:'app-vendas',imports:[ReactiveFormsModule],template:`
<div class="page-header"><div><h1>Vendas</h1><p>Registre vendas com baixa automática do estoque de produtos.</p></div></div>
<form class="card" [formGroup]="form" (ngSubmit)="salvar()">
<div class="form-grid">
<label>Cliente<input maxlength="150" formControlName="cliente" placeholder="Consumidor final"></label>
<label>Forma de pagamento<select formControlName="formaPagamento"><option value="DINHEIRO">Dinheiro</option><option value="PIX">PIX</option><option value="CARTAO">Cartão</option><option value="TRANSFERENCIA">Transferência</option></select></label>
</div>
<h2>Itens da venda</h2>
<div formArrayName="itens">
@for(item of itens.controls;track item;let i=$index){<div [formGroupName]="i" class="form-grid" style="margin-bottom:1rem">
<label>Produto *<select formControlName="idProduto"><option [ngValue]="null">Selecione</option>@for(p of produtos();track p.idProduto){<option [ngValue]="p.idProduto">{{p.nome}} ({{p.quantidadeEstoque}} {{p.unidadeMedida}})</option>}</select></label>
<label>Quantidade *<input type="number" formControlName="quantidade" min="0.001" step="0.001"></label>
<label>Preço unitário (R$) *<input type="number" formControlName="precoUnitario" min="0.01" step="0.01"></label>
<button class="btn btn--ghost" type="button" (click)="removerItem(i)" [disabled]="itens.length===1">Remover item</button>
</div>}
</div>
<button type="button" class="btn btn--outline" (click)="adicionarItem()">+ Adicionar produto</button>
<div class="form-actions"><button [disabled]="saving()" type="submit" class="btn btn--primary">Registrar venda</button></div>
</form>
@if(error()){<div class="card">Falha ao consultar vendas. <button class="btn btn--outline" (click)="carregar()">Tentar novamente</button></div>}
<div class="table-wrap" style="margin-top:1rem"><table class="table"><thead><tr><th>Data</th><th>Cliente</th><th>Valor</th><th>Pagamento</th><th>Status</th><th>Ações</th></tr></thead><tbody>
@for(v of vendas();track v.idVenda){<tr><td>{{v.dataVenda}}</td><td>{{v.cliente}}</td><td>{{moeda(v.valorTotal)}}</td><td>{{v.formaPagamento}}</td><td>{{v.status}}</td>
<td>@if(v.status!=='CANCELADA'){<button class="btn btn--danger btn--sm" (click)="cancelar(v)">Cancelar venda</button>}</td></tr>}
@empty{<tr><td colspan="6">Nenhuma venda realizada.</td></tr>}</tbody></table></div>
`})
export class VendasComponent implements OnInit {
 private readonly http=inject(HttpClient);private readonly produtosApi=inject(ProdutoService);
 private readonly notify=inject(NotificationService);private readonly confirm=inject(ConfirmService);
 private readonly fb=inject(FormBuilder).nonNullable;
 readonly produtos=signal<Produto[]>([]);readonly vendas=signal<Venda[]>([]);readonly saving=signal(false);readonly error=signal(false);
 readonly form=this.fb.group({cliente:[''],formaPagamento:['PIX'],itens:this.fb.array([this.novoItem()])});
 get itens():FormArray<ReturnType<VendasComponent['novoItem']>>{return this.form.controls.itens;}
 novoItem(){return this.fb.group({idProduto:[null as number|null,Validators.required],quantidade:[null as number|null,[Validators.required,Validators.min(0.001)]],precoUnitario:[null as number|null,[Validators.required,Validators.min(0.01)]]});}
 adicionarItem(){this.itens.push(this.novoItem());}
 removerItem(i:number){if(this.itens.length>1)this.itens.removeAt(i);}
 ngOnInit(){this.carregar();}
 carregar(){forkJoin({produtos:this.produtosApi.list(),vendas:this.http.get<Venda[]>(environment.apiUrl+'/vendas')}).subscribe({next:r=>{this.produtos.set(r.produtos);this.vendas.set(r.vendas);this.error.set(false);},error:()=>this.error.set(true)});}
 moeda(valor:number){return Number(valor).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
 salvar(){if(this.form.invalid){this.form.markAllAsTouched();this.notify.error('Preencha os itens da venda.');return;}const v=this.form.getRawValue();
 const agregadas=new Map<number,number>();for(const item of v.itens){const id=item.idProduto!;agregadas.set(id,(agregadas.get(id)||0)+Number(item.quantidade));}
 for(const [id,qtd] of agregadas){const p=this.produtos().find(x=>x.idProduto===id);if(!p||qtd>p.quantidadeEstoque){this.notify.error('Estoque insuficiente para '+(p?.nome||'o produto selecionado'));return;}}
 const payload={cliente:v.cliente,formaPagamento:v.formaPagamento,itens:v.itens.map(i=>({idProduto:i.idProduto,quantidade:Number(i.quantidade),precoUnitario:Number(i.precoUnitario)}))};
 this.saving.set(true);this.http.post(environment.apiUrl+'/vendas',payload).subscribe({next:()=>{this.saving.set(false);this.itens.clear();this.adicionarItem();this.notify.success('Venda realizada.');this.carregar();},error:()=>this.saving.set(false)});}
 async cancelar(v:Venda){if(!await this.confirm.ask({title:'Cancelar venda',message:'Cancelar venda #'+v.idVenda+'? O estoque será estornado.',confirmLabel:'Cancelar venda',danger:true}))return;this.http.patch(environment.apiUrl+'/vendas/'+v.idVenda+'/cancelar',{}).subscribe(()=>{this.notify.success('Venda cancelada.');this.carregar();});}
}
