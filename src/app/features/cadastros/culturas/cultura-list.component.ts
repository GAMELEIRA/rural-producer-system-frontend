import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CulturaService } from '../../../core/cadastros/cadastros.services';
import { Cultura } from '../../../core/models/cadastros.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CrudListBase } from '../shared/crud-list.base';

@Component({
  selector: 'app-cultura-list',
  imports: [RouterLink, EmptyStateComponent],
  templateUrl: './cultura-list.component.html',
})
export class CulturaListComponent extends CrudListBase<Cultura> {
  protected readonly service = inject(CulturaService);
  protected readonly entityLabel = 'cultura';
  protected override readonly feminine = true;

  protected idOf(item: Cultura): number {
    return item.idCultura;
  }

  protected nameOf(item: Cultura): string {
    return item.nome;
  }
}
