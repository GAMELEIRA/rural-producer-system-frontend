import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CulturaService, InsumoService, ProdutoService } from '../../core/cadastros/cadastros.services';
import { Cultura, Insumo, Produto } from '../../core/models/cadastros.model';
import { IMAGENS_CULTURAS, IMAGENS_INSUMOS, imagemDoCadastro } from '../../core/models/imagens-catalogo';
import { NotificationService } from '../../core/notifications/notification.service';

type Classe = 'produto' | 'insumo';
type Sentido = 'ENTRADA' | 'SAIDA';
interface MovimentoProduto {
  idMovimentacao: number; idProduto: number; nomeProduto: string; tipo: string;
  quantidade: number; saldoAnterior: number; saldoPosterior: number;
  dataMovimentacao: string; origem?: string; observacoes?: string;
}
interface MovimentoInsumo {
  idMovimentacao: number; idInsumo: number; nomeInsumo: string; tipo: string;
  quantidade: number; dataMovimentacao: string; origem: string;
}
interface Registro {
  chave: string; tipo: Sentido; descricao: string; quantidade: number;
  data: string; origem: string; identificador: string;
}
interface Saldo {
  chave: string; id: number; classe: Classe; nome: string; imagem: string | null;
  unidade: string; saldo: number; preco: number;
  totalEntradas: number; totalSaidas: number; registros: Registro[];
}

@Component({
  selector: 'app-estoque',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    <div class="page-header">
      <div><h1>Estoque da propriedade</h1><p>Um resumo por produto ou insumo. Abra os detalhes para ver cada entrada e saída.</p></div>
    </div>

    <form class="card" [formGroup]="form" (ngSubmit)="salvar()">
      <h2>Registrar movimentação</h2>
      <div class="form-grid">
        <label>Categoria *
          <select formControlName="classe">
            <option value="produto">Produto colhido / comercializado</option>
            <option value="insumo">Insumo agrícola</option>
          </select>
        </label>
        <label>Operação *
          <select formControlName="operacao">
            <option value="entrada">Entrada / reposição</option>
            <option value="saida">Saída / descarte</option>
          </select>
        </label>
        <label>Item *
          <select formControlName="idItem">
            <option [ngValue]="null">Selecione</option>
            @if (form.controls.classe.value === 'produto') {
              @for (p of produtos(); track p.idProduto) {
                <option [ngValue]="p.idProduto">{{p.nome}} — {{p.quantidadeEstoque}} {{p.unidadeMedida}}</option>
              }
            } @else {
              @for (i of insumos(); track i.idInsumo) {
                <option [ngValue]="i.idInsumo">{{i.nome}} — {{i.quantidadeEstoque}} {{i.unidadeMedida}}</option>
              }
            }
          </select>
        </label>
        <label>Quantidade *
          <input type="number" min="0.001" step="0.001" formControlName="quantidade">
        </label>
        <label>Motivo / origem <input formControlName="motivo" maxlength="100"></label>
        @if (form.controls.classe.value === 'produto') {
          <label>Observações <input formControlName="observacoes" maxlength="500"></label>
        }
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn--primary" [disabled]="salvando()">
          {{salvando() ? 'Salvando...' : 'Registrar movimentação'}}
        </button>
      </div>
      <p class="subtle">Aplicações de insumos, colheitas e vendas continuam registrando seus movimentos automaticamente.</p>
    </form>

    @if (erro()) {
      <div class="card">Falha ao consultar o estoque. <button class="btn btn--outline" (click)="carregar()">Tentar novamente</button></div>
    }

    <div class="card stock-filters">
      <label>Pesquisar no estoque
        <input type="search" placeholder="Nome do item ou categoria" [value]="pesquisa()"
          (input)="pesquisa.set($any($event.target).value)">
      </label>
      <label>Mostrar
        <select [value]="filtroClasse()" (change)="filtroClasse.set($any($event.target).value)">
          <option value="todos">Todos os itens</option>
          <option value="produto">Produtos</option>
          <option value="insumo">Insumos</option>
        </select>
      </label>
    </div>
    <div class="stock-totals">
      <div class="card"><span>Itens encontrados</span><strong>{{filtradas().length}}</strong></div>
      <div class="card"><span>Valor atual em estoque</span><strong>{{valorAtual() | currency:'BRL'}}</strong></div>
    </div>

    <p class="subtle">Valor estimado: saldo atual × preço cadastrado (preço de venda para produtos e preço unitário para insumos).</p>
    <div class="table-wrap">
      <table class="table">
        <thead><tr>
          <th>Item</th><th>Categoria</th><th class="table__num">Saldo atual</th>
          <th class="table__num">Valor atual</th><th class="table__num">Entradas registradas</th>
          <th class="table__num">Saídas registradas</th><th>Ações</th>
        </tr></thead>
        <tbody>
          @for (s of filtradas(); track s.chave) {
            <tr>
              <td><div class="stock-item">
                @if (s.imagem) { <img [src]="s.imagem" alt="" loading="lazy"> }
                <strong>{{s.nome}}</strong>
              </div></td>
              <td>{{s.classe === 'insumo' ? 'Insumo' : 'Produto'}}</td>
              <td class="table__num">{{s.saldo | number:'1.0-3'}} {{s.unidade}}</td>
              <td class="table__num">{{s.saldo * s.preco | currency:'BRL'}}</td>
              <td class="table__num">{{s.totalEntradas | number:'1.0-3'}} {{s.unidade}}</td>
              <td class="table__num">{{s.totalSaidas | number:'1.0-3'}} {{s.unidade}}</td>
              <td><button type="button" class="btn btn--outline btn--sm" (click)="alternarDetalhes(s.chave)">
                {{selecionado() === s.chave ? 'Fechar' : 'Ver detalhes'}}
              </button></td>
            </tr>
          } @empty {
            <tr><td colspan="7">Nenhum item corresponde aos filtros.</td></tr>
          }
        </tbody>
      </table>
    </div>
    @if (detalhe(); as s) {
      <section class="card details">
        <div class="details-header">
          <div><h2>Histórico: {{s.nome}}</h2>
            <p><strong>Saldo atual:</strong> {{s.saldo | number:'1.0-3'}} {{s.unidade}} ·
              <strong>Valor atual:</strong> {{s.saldo * s.preco | currency:'BRL'}} ·
              <strong>Total de saídas:</strong> {{s.totalSaidas | number:'1.0-3'}} {{s.unidade}}</p>
          </div>
          <button type="button" class="btn btn--ghost" (click)="selecionado.set(null)">Fechar</button>
        </div>
        <div class="stock-filters">
          <label>Pesquisar lançamentos
            <input type="search" placeholder="Origem, operação ou código" [value]="pesquisaMovimento()"
              (input)="pesquisaMovimento.set($any($event.target).value)">
          </label>
          <label>Operação
            <select [value]="filtroTipo()" (change)="filtroTipo.set($any($event.target).value)">
              <option value="todos">Entradas e saídas</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SAIDA">Saídas</option>
            </select>
          </label>
        </div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Data</th><th>Operação</th><th>Detalhe</th><th>Origem</th><th class="table__num">Quantidade</th></tr></thead>
          <tbody>
            @for (m of detalheMovimentos(); track m.chave) {
              <tr><td>{{m.data | date:'dd/MM/yyyy HH:mm'}}</td><td>{{m.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}}</td>
                <td>{{m.descricao}}</td><td>{{m.origem || '—'}}</td>
                <td class="table__num">{{m.quantidade | number:'1.0-3'}} {{s.unidade}}</td>
              </tr>
            } @empty {<tr><td colspan="5">Nenhuma movimentação encontrada para os filtros selecionados.</td></tr>}
          </tbody>
        </table></div>
        <p class="subtle">O histórico de insumos inclui aplicações ainda existentes importadas na migração e registros feitos após a atualização. Movimentações manuais antigas sem registro permanecem apenas no saldo atual.</p>
      </section>
    }
  `,
  styles: [`
    .stock-filters {display:flex;flex-wrap:wrap;gap:1rem;margin:1rem 0;align-items:end}
    .stock-filters label {min-width:190px;flex:1}
    .stock-totals {display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1rem;margin-bottom:1rem}
    .stock-totals .card {display:flex;flex-direction:column;gap:.25rem}
    .stock-totals strong {font-size:1.3rem}
    .stock-item {display:flex;align-items:center;gap:.55rem}
    .stock-item img {width:36px;height:36px;object-fit:contain}
    .details {margin-top:1.2rem}
    .details-header {display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem}
    .subtle {opacity:.72;font-size:.86rem}
  `]
})
export class EstoqueComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly produtosApi = inject(ProdutoService);
  private readonly insumosApi = inject(InsumoService);
  private readonly culturasApi = inject(CulturaService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly notify = inject(NotificationService);

  readonly produtos = signal<Produto[]>([]);
  readonly insumos = signal<Insumo[]>([]);
  readonly culturas = signal<Cultura[]>([]);
  readonly movimentosProdutos = signal<MovimentoProduto[]>([]);
  readonly movimentosInsumos = signal<MovimentoInsumo[]>([]);
  readonly pesquisa = signal('');
  readonly pesquisaMovimento = signal('');
  readonly filtroClasse = signal<'todos' | Classe>('todos');
  readonly filtroTipo = signal<'todos' | Sentido>('todos');
  readonly selecionado = signal<string | null>(null);
  readonly salvando = signal(false);
  readonly erro = signal(false);

  readonly form = this.fb.group({
    classe: ['produto', Validators.required],
    operacao: ['entrada', Validators.required],
    idItem: [null as number | null, Validators.required],
    quantidade: [null as number | null, [Validators.required, Validators.min(0.001)]],
    motivo: [''],
    observacoes: ['']
  });

  readonly saldos = computed<Saldo[]>(() => {
    const produtos = this.produtos().map(p => {
      const movimentos = this.movimentosProdutos().filter(m => m.idProduto === p.idProduto).map(m => ({
        chave: 'produto-' + m.idMovimentacao,
        tipo: (m.tipo.startsWith('ENTRADA') ? 'ENTRADA' : 'SAIDA') as Sentido,
        descricao: m.tipo.replaceAll('_', ' '),
        quantidade: Number(m.quantidade),
        data: m.dataMovimentacao,
        origem: m.origem || m.observacoes || '',
        identificador: String(m.idMovimentacao)
      }));
      const cultura = this.culturas().find(c => c.nome.toLocaleLowerCase('pt-BR') === p.nome.toLocaleLowerCase('pt-BR'));
      return this.agrupamento('produto', p.idProduto, p.nome, p.unidadeMedida, Number(p.quantidadeEstoque),
        Number(p.precoVenda), cultura ? imagemPorCodigo(IMAGENS_CULTURAS, cultura.imagemCodigo) : null, movimentos);
    });
    const insumos = this.insumos().map(i => {
      const movimentos = this.movimentosInsumos().filter(m => m.idInsumo === i.idInsumo).map(m => ({
        chave: 'insumo-' + m.idMovimentacao,
        tipo: ((m.tipo.startsWith('ENTRADA') || m.tipo === 'AJUSTE_ENTRADA') ? 'ENTRADA' : 'SAIDA') as Sentido,
        descricao: m.tipo.replaceAll('_', ' '),
        quantidade: Number(m.quantidade),
        data: m.dataMovimentacao,
        origem: m.origem,
        identificador: String(m.idMovimentacao)
      }));
      return this.agrupamento('insumo', i.idInsumo, i.nome, i.unidadeMedida, Number(i.quantidadeEstoque),
        Number(i.precoUnitario), imagemPorCodigo(IMAGENS_INSUMOS, i.imagemCodigo), movimentos);
    });
    return [...produtos, ...insumos].sort((a,b) => a.nome.localeCompare(b.nome,'pt-BR'));
  });
  readonly filtradas = computed(() => this.saldos().filter(s =>
    (this.filtroClasse() === 'todos' || s.classe === this.filtroClasse()) &&
    (s.nome + ' ' + s.classe).toLocaleLowerCase('pt-BR').includes(this.pesquisa().trim().toLocaleLowerCase('pt-BR'))));
  readonly valorAtual = computed(() => this.filtradas().reduce((acc,s) => acc + s.saldo*s.preco, 0));
  readonly detalhe = computed(() => this.saldos().find(s => s.chave === this.selecionado()) ?? null);
  readonly detalheMovimentos = computed(() => (this.detalhe()?.registros ?? []).filter(m =>
    (this.filtroTipo() === 'todos' || m.tipo === this.filtroTipo()) &&
    (m.descricao + ' ' + m.origem + ' ' + m.identificador).toLocaleLowerCase('pt-BR')
      .includes(this.pesquisaMovimento().trim().toLocaleLowerCase('pt-BR')))
      .sort((a,b) => b.data.localeCompare(a.data)));

  ngOnInit(): void {
    this.form.controls.classe.valueChanges.subscribe(() => this.form.controls.idItem.setValue(null));
    this.carregar();
  }
  private agrupamento(classe: Classe, id: number, nome: string, unidade: string, saldo: number,
      preco: number, imagem: string | null, registros: Registro[]): Saldo {
    return {chave: classe + '-' + id, id, classe, nome, unidade, saldo, preco,
      totalEntradas: registros.filter(m => m.tipo === 'ENTRADA').reduce((sum,m) => sum + m.quantidade,0),
      totalSaidas: registros.filter(m => m.tipo === 'SAIDA').reduce((sum,m) => sum + m.quantidade,0),
      imagem, registros};
  }
  alternarDetalhes(chave: string): void {
    this.selecionado.set(this.selecionado() === chave ? null : chave);
    this.pesquisaMovimento.set('');
    this.filtroTipo.set('todos');
  }
  carregar(): void {
    forkJoin({
      produtos: this.produtosApi.list(), insumos: this.insumosApi.list(), culturas: this.culturasApi.list(),
      produtosMov: this.http.get<MovimentoProduto[]>(environment.apiUrl+'/estoque'),
      insumosMov: this.http.get<MovimentoInsumo[]>(environment.apiUrl+'/estoque/insumos')
    }).subscribe({next: r => {
      this.produtos.set(r.produtos); this.insumos.set(r.insumos); this.culturas.set(r.culturas);
      this.movimentosProdutos.set(r.produtosMov); this.movimentosInsumos.set(r.insumosMov);
      this.erro.set(false);
    }, error: () => this.erro.set(true)});
  }
  salvar(): void {
    if (this.form.invalid) {this.form.markAllAsTouched();this.notify.error('Preencha os campos obrigatórios.');return;}
    const v = this.form.getRawValue();
    const entrada = v.operacao === 'entrada';
    const insumo = v.classe === 'insumo';
    const url = environment.apiUrl + '/estoque/' + (insumo ? 'insumos/' : '') + (entrada ? 'entrada' : 'saida');
    const origem = v.motivo?.trim() || (entrada ? 'Entrada manual' : 'Saída manual');
    const dados = insumo ? {idInsumo:v.idItem,quantidade:v.quantidade,origem} :
      entrada ? {idProduto:v.idItem,quantidade:v.quantidade,tipo:'ENTRADA_AVULSA',origem,observacoes:v.observacoes} :
      {idProduto:v.idItem,quantidade:v.quantidade,tipo:'SAIDA_AVULSA',motivo:origem,observacoes:v.observacoes};
    this.salvando.set(true);
    this.http.post(url, dados).subscribe({
      next: () => {this.salvando.set(false);this.form.reset({classe:v.classe,operacao:'entrada'});
        this.notify.success('Movimentação registrada.');this.carregar();},
      error: () => this.salvando.set(false)
    });
  }
}
