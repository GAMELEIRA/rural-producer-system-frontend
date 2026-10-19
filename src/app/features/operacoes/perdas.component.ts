import { Component, inject, OnInit, signal } from '@angular/core';
import { AppModalComponent } from '../../shared/components/app-modal/app-modal.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProducaoService, Plantacao } from '../producao/producao.service';
import { rotuloPlantacao, descricaoPlantacao } from '../producao/plantacao-identificacao';
import { ProdutoService } from '../../core/cadastros/cadastros.services';
import { Produto } from '../../core/models/cadastros.model';
import { NotificationService } from '../../core/notifications/notification.service';
import { ConfirmService } from '../../core/notifications/confirm.service';
@Component({selector:'app-perdas', imports:[ReactiveFormsModule,AppModalComponent],template:`
<div class="page-header"><div><h1>Perdas agrícolas</h1><p>Registre e acompanhe os lançamentos vinculados aos cultivos.</p></div></div>
<form class="card" [formGroup]="form" (ngSubmit)="salvar()"><div class="form-grid"><label>Plantação *
<select formControlName="idPlantacao">
  <option [ngValue]="null">Selecione</option>
  @for (p of plantacoes(); track p.idPlantacao) {
    <option [ngValue]="p.idPlantacao">{{rotuloPlantacao(p)}}</option>
  }
</select>
@if (plantacaoSelecionada(); as selecionada) {
  <small>{{descricaoPlantacao(selecionada)}}</small>
}
</label>
<label>Data da perda *<input type="date" formControlName="dataPerda"></label>
@if(plantacaoSelecionada();as p){
 <p class="form-grid__full">{{p.status==='COLHIDA' || p.status==='COLHIDO' ? 'Perda após a colheita: será descontada imediatamente do produto em estoque (quando houver saldo).' : 'Perda no campo: fica vinculada à plantação. Como ainda não houve entrada da colheita, não reduz o estoque físico de produtos.'}}</p>
}
<label>Quantidade perdida *<input type="number" step="0.01" min="0.01" formControlName="quantidade"></label>
<label>Motivo *<input type="text" formControlName="motivo"></label>
@if (produtosParaPrecificacao().length > 1) {
  <label>Produto de referência do prejuízo
    <select formControlName="idProdutoPreco">
      <option [ngValue]="null">Selecione o produto para calcular</option>
      @for (produto of produtosParaPrecificacao(); track produto.idProduto) {
        <option [ngValue]="produto.idProduto">{{produto.nome}} — {{moeda(produto.precoVenda)}} / {{produto.unidadeMedida}}</option>
      }
    </select>
  </label>
}
<label>Prejuízo estimado (R$)
  <input type="number" step="0.01" min="0" formControlName="valorEstimado"
         placeholder="Preenchimento automático, quando houver preço">
</label>
<div class="form-grid__full">
  @if (produtoParaPrecificacao(); as produto) {
    <p>Valor sugerido: <strong>{{moeda(prejuizoSugerido())}}</strong>
      ({{form.controls.quantidade.value || 0}} {{produto.unidadeMedida}} ×
      {{moeda(produto.precoVenda)}} / {{produto.unidadeMedida}}).
      Baseado no preço de venda do produto, não no custo de produção.</p>
    @if (valorEditadoManualmente()) {
      <button type="button" class="btn btn--outline btn--sm" (click)="usarValorSugerido()">
        Usar valor sugerido
      </button>
    } @else {
      <small>O cálculo é atualizado ao alterar a quantidade. Você pode editar o valor livremente.</small>
    }
  } @else if (form.controls.idPlantacao.value !== null) {
    <p>Não há um produto com preço identificado automaticamente para esta plantação.
    @if (produtosParaPrecificacao().length > 1) { Selecione o produto de referência acima. }
    @else { Vincule ou cadastre um produto da cultura para obter uma sugestão. }
    Você também pode informar o prejuízo manualmente.</p>
  }
</div>
<label>Observações<input type="text"  formControlName="observacoes"></label></div>
<div class="form-actions"><button class="btn btn--primary" type="submit" [disabled]="saving()">Registrar</button></div></form>
@if(error()){<div class="card">Não foi possível carregar os dados. <button class="btn btn--outline" (click)="carregar()">Tentar novamente</button></div>}
@if(carregando()){<p role="status">Consultando perdas agrícolas...</p>}
<div class="rural-cards">
@for(item of registros();track item['idPerda']){<article class="card rural-entry">
<button type="button" class="rural-entry__trigger" (click)="detalhe.set(detalhe()===item['idPerda']?null:item['idPerda'])">
<strong>{{item['motivo']}}</strong><span>{{identificacaoPorId(item['idPlantacao'], item['nomeCultura'])}} · {{item['dataPerda']}}</span><strong>{{item['quantidade']}} perdidos</strong><span>{{rotuloEtapa(item['etapa'])}}</span><span>Prejuízo: {{moeda(item['valorEstimado'])}}</span><span>Ver detalhes</span>
</button>
@if(detalhe()===item['idPerda']){<app-modal titulo="Perda agrícola" (fechado)="detalhe.set(null)"><p>Registro #{{item['idPerda']}} · Talhão: {{item['nomeTalhao']||'—'}}</p><p>Etapa: {{rotuloEtapa(item['etapa'])}}</p><p>{{item['observacoes']||'Sem observações adicionais'}}</p><button class="btn btn--danger btn--sm" (click)="excluir(item)">Excluir perda</button></app-modal>}
</article>}@empty{<div class="card">Nenhuma perda registrada.</div>}
</div>
`})
export class PerdasComponent implements OnInit {
 private readonly http=inject(HttpClient);private readonly api=inject(ProducaoService);private readonly produtosApi=inject(ProdutoService);
 private readonly fb=inject(FormBuilder).nonNullable;private readonly notify=inject(NotificationService);private readonly confirm=inject(ConfirmService);
 readonly rotuloPlantacao = rotuloPlantacao;
 readonly descricaoPlantacao = descricaoPlantacao;
 readonly registros=signal<Record<string,any>[]>([]);readonly plantacoes=signal<Plantacao[]>([]);readonly produtos=signal<Produto[]>([]);
 readonly valorEditadoManualmente=signal(false);
 readonly detalhe=signal<number|null>(null);readonly saving=signal(false);readonly error=signal(false);readonly carregando=signal(false);
 plantacaoSelecionada(){return this.plantacoes().find(p=>p.idPlantacao===this.form.controls.idPlantacao.value)??null;}
 identificacaoPorId(id:number,nomeCultura?:string): string {
   const p=this.plantacoes().find(x=>x.idPlantacao===id);
   return p ? rotuloPlantacao(p) : (nomeCultura || 'Plantação') + ' · #' + id;
 }
 rotuloEtapa(etapa?:string){return etapa==='POS_COLHEITA'?'Após colheita — saída do estoque':etapa==='NA_COLHEITA'?'Na colheita — abatida da entrada':'No campo — antes da colheita';}readonly campos=["idPlantacao","dataPerda","quantidade","motivo","valorEstimado","observacoes"];
 readonly form=this.fb.group({idPlantacao:[null as number|null,[Validators.required]],idProdutoPreco:[null as number|null],dataPerda:['',[Validators.required]],quantidade:[null as number|null,[Validators.required,Validators.min(0.01)]],motivo:['',[Validators.required]],valorEstimado:[null as number|null,[Validators.min(0)]],observacoes:['',[]]});
 private readonly endpoint=environment.apiUrl+'/perdas';
 moeda(n:number){return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
 produtosParaPrecificacao(): Produto[] {
   const plantacao=this.plantacaoSelecionada();
   if(!plantacao)return [];
   const vinculado=this.produtos().find(p=>p.idProduto===plantacao.idProdutoColheita);
   if(vinculado)return [vinculado];
   const porCultura=this.produtos().filter(p=>p.idCultura===plantacao.idCultura);
   if(porCultura.length)return porCultura;
   // Compatibilidade com cadastros antigos que ainda não possuíam idCultura.
   return this.produtos().filter(p=>!p.idCultura&&p.nome.trim().toLocaleLowerCase('pt-BR')===plantacao.nomeCultura.trim().toLocaleLowerCase('pt-BR'));
 }
 produtoParaPrecificacao(): Produto | null {
   const id=this.form.controls.idProdutoPreco.value;
   return this.produtosParaPrecificacao().find(p=>p.idProduto===id)??null;
 }
 prejuizoSugerido(): number {
   const produto=this.produtoParaPrecificacao();
   const qtd=this.form.controls.quantidade.value;
   if(!produto||qtd===null||qtd<=0)return 0;
   return Math.round((Number(qtd)*Number(produto.precoVenda)+Number.EPSILON)*100)/100;
 }
 private recalcularPrejuizo(): void {
   if(this.valorEditadoManualmente())return;
   const qtd=this.form.controls.quantidade.value;
   const produto=this.produtoParaPrecificacao();
   this.form.controls.valorEstimado.setValue(produto&&qtd!==null&&qtd>0?this.prejuizoSugerido():null,{emitEvent:false});
 }
 private atualizarProdutoSugerido(): void {
   const opcoes=this.produtosParaPrecificacao();
   this.form.controls.idProdutoPreco.setValue(opcoes.length===1?opcoes[0].idProduto:null,{emitEvent:false});
   this.valorEditadoManualmente.set(false);
   this.recalcularPrejuizo();
 }
 usarValorSugerido(): void {
   this.valorEditadoManualmente.set(false);
   this.recalcularPrejuizo();
 }
 ngOnInit(){
   this.form.controls.idPlantacao.valueChanges.subscribe(()=>this.atualizarProdutoSugerido());
   this.form.controls.idProdutoPreco.valueChanges.subscribe(()=>this.usarValorSugerido());
   this.form.controls.quantidade.valueChanges.subscribe(()=>this.recalcularPrejuizo());
   this.form.controls.valorEstimado.valueChanges.subscribe(()=>this.valorEditadoManualmente.set(true));
   this.carregar();
 }
 carregar(){this.carregando.set(true);forkJoin({registros:this.http.get<Record<string,any>[]>(this.endpoint),plantacoes:this.api.listarPlantacoes(),produtos:this.produtosApi.list()}).subscribe({next:r=>{this.registros.set(r.registros);this.plantacoes.set(r.plantacoes);this.produtos.set(r.produtos);this.error.set(false);this.carregando.set(false);this.atualizarProdutoSugerido();},error:()=>{this.error.set(true);this.carregando.set(false);}});}
 salvar(){if(this.form.invalid){this.form.markAllAsTouched();this.notify.error('Preencha os campos obrigatórios.');return;}this.saving.set(true);const {idProdutoPreco, ...payload}=this.form.getRawValue();this.http.post(this.endpoint,payload).subscribe({next:()=>{this.saving.set(false);this.form.reset({idPlantacao:null,idProdutoPreco:null,quantidade:null,valorEstimado:null});this.valorEditadoManualmente.set(false);this.notify.success('Perda registrada com prejuízo estimado.');this.carregar();},error:()=>this.saving.set(false)});}
 async excluir(item:Record<string,any>){if(!await this.confirm.ask({title:'Excluir registro',message:'Excluir o registro selecionado?',confirmLabel:'Excluir',danger:true}))return;this.saving.set(true);this.http.delete(this.endpoint+'/'+item['idPerda']).subscribe({next:()=>{this.saving.set(false);this.detalhe.set(null);this.notify.success('Registro excluído e estoque ajustado quando aplicável.');this.carregar();},error:()=>this.saving.set(false)});}
}
