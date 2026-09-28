import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TalhaoService } from '../../../core/cadastros/cadastros.services';
import { Talhao } from '../../../core/models/cadastros.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CrudListBase } from '../shared/crud-list.base';

@Component({
  selector: 'app-talhao-list',
  imports: [RouterLink, DecimalPipe, EmptyStateComponent],
  templateUrl: './talhao-list.component.html',
})
export class TalhaoListComponent extends CrudListBase<Talhao> {
  protected readonly service = inject(TalhaoService);
  protected readonly entityLabel = 'talhão';

  protected idOf(item: Talhao): number {
    return item.idTalhao;
  }

  protected nameOf(item: Talhao): string {
    return item.nome;
  }
}
