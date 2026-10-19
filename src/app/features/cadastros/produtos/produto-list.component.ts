import { Component, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProdutoService } from '../../../core/cadastros/cadastros.services';
import { Produto } from '../../../core/models/cadastros.model';
import { IMAGENS_CULTURAS, imagemDoCadastro } from '../../../core/models/imagens-catalogo';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CrudListBase } from '../shared/crud-list.base';

@Component({
  selector: 'app-produto-list',
  imports: [RouterLink, DecimalPipe, CurrencyPipe, EmptyStateComponent],
  templateUrl: './produto-list.component.html',
})
export class ProdutoListComponent extends CrudListBase<Produto> {
  protected readonly service = inject(ProdutoService);
  protected readonly entityLabel = 'produto';
  protected readonly imagem = (item: Produto) => imagemDoCadastro(IMAGENS_CULTURAS,item.imagemCodigo,item.imagemPersonalizada);

  protected idOf(item: Produto): number {
    return item.idProduto;
  }

  protected nameOf(item: Produto): string {
    return item.nome;
  }
}
