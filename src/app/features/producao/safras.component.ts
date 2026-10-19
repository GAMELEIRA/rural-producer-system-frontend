import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProducaoService, Safra } from './producao.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { ConfirmService } from '../../core/notifications/confirm.service';
@Component({
  selector: 'app-safras', imports: [ReactiveFormsModule],
  template: `
  <div class="page-header"><div><h1>Safras</h1><p>Organize os ciclos de produção agrícola.</p></div></div>
  <form class="card" [formGroup]="form" (ngSubmit)="salvar()">
    <div class="form-grid">
      <label>Nome *<input formControlName="nome" placeholder="Ex.: Safra 2026/2027"></label>
      <label>Início *<input type="date" formControlName="dataInicio"></label>
      <label>Término *<input type="date" formControlName="dataFim"></label>
    </div>
    <div class="form-actions"><button class="btn btn--primary" [disabled]="saving()" type="submit">Cadastrar safra</button></div>
  </form>
  @if (error()) { <p class="table__warn">Não foi possível carregar as safras. <button class="btn btn--outline" (click)="carregar()">Tentar novamente</button></p> }
  @if(carregando()){<p role="status">Consultando safras...</p>}
  <div class="table-wrap" style="margin-top:1.25rem">
    <table class="table"><thead><tr><th>Safra</th><th>Início</th><th>Término</th><th>Status</th><th>Plantações</th><th>Ações</th></tr></thead>
    <tbody>@for (s of safras(); track s.idSafra) {
      <tr><td>{{s.nome}}</td><td>{{s.dataInicio}}</td><td>{{s.dataFim}}</td><td>{{s.status}}</td><td>{{s.totalPlantacoes}}</td>
      <td class="table__actions">@if (s.status !== 'FINALIZADA') { <button class="btn btn--outline btn--sm" (click)="finalizar(s)">Finalizar</button> }
      <button class="btn btn--danger btn--sm" (click)="excluir(s)">Excluir</button></td></tr>
    } @empty { <tr><td colspan="6">Nenhuma safra cadastrada.</td></tr> }</tbody></table>
  </div>`
})
export class SafrasComponent implements OnInit {
  private readonly api = inject(ProducaoService);
  private readonly notify = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly safras = signal<Safra[]>([]);
  readonly saving = signal(false);
  readonly error = signal(false);
  readonly carregando = signal(false);
  readonly form = this.fb.group({nome:['',[Validators.required,Validators.maxLength(100)]],dataInicio:['',Validators.required],dataFim:['',Validators.required]});
  ngOnInit(){this.carregar();}
  carregar(){this.carregando.set(true);this.api.listarSafras().subscribe({next:x=>{this.safras.set(x);this.error.set(false);this.carregando.set(false);},error:()=>{this.error.set(true);this.carregando.set(false);}});}
  salvar(){if(this.form.invalid){this.form.markAllAsTouched();return;}const dados=this.form.getRawValue();if(dados.dataFim<dados.dataInicio){this.notify.error('O término deve ser posterior ao início.');return;}this.saving.set(true);this.api.criarSafra(dados).subscribe({next:()=>{this.form.reset();this.carregar();this.notify.success('Safra cadastrada.');this.saving.set(false);},error:()=>this.saving.set(false)});}
  async finalizar(s:Safra){if(!await this.confirm.ask({title:'Finalizar safra',message:'Encerrar a safra '+s.nome+'?',confirmLabel:'Finalizar'}))return;this.api.finalizarSafra(s.idSafra).subscribe(()=>{this.notify.success('Safra finalizada.');this.carregar();});}
  async excluir(s:Safra){if(!await this.confirm.ask({title:'Excluir safra',message:'Excluir '+s.nome+'?',confirmLabel:'Excluir',danger:true}))return;this.api.excluirSafra(s.idSafra).subscribe(()=>{this.notify.success('Safra excluída.');this.carregar();});}
}
