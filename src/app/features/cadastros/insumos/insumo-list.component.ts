import { Component, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InsumoService } from '../../../core/cadastros/cadastros.services';
import { Insumo } from '../../../core/models/cadastros.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CrudListBase } from '../shared/crud-list.base';

@Component({
  selector: 'app-insumo-list',
  imports: [RouterLink, DecimalPipe, CurrencyPipe, EmptyStateComponent],
  templateUrl: './insumo-list.component.html',
})
export class InsumoListComponent extends CrudListBase<Insumo> {
  protected readonly service = inject(InsumoService);
  protected readonly entityLabel = 'insumo';

  protected idOf(item: Insumo): number {
    return item.idInsumo;
  }

  protected nameOf(item: Insumo): string {
    return item.nome;
  }
}
