import { Directive, OnInit, inject, signal } from '@angular/core';
import { CrudApiService } from '../../../core/cadastros/crud-api.service';
import { ConfirmService } from '../../../core/notifications/confirm.service';
import { NotificationService } from '../../../core/notifications/notification.service';

/**
 * Comportamento comum das telas de listagem: carregar, recarregar e excluir
 * com confirmação. Erros HTTP já geram toast pelo `errorInterceptor`.
 */
@Directive()
export abstract class CrudListBase<T> implements OnInit {
  protected readonly notifications = inject(NotificationService);
  protected readonly confirm = inject(ConfirmService);

  protected abstract readonly service: CrudApiService<T, unknown>;
  /** Nome da entidade em minúsculas, no singular (ex.: "cultura"). */
  protected abstract readonly entityLabel: string;
  /** Gênero gramatical do rótulo, para concordância nas mensagens. */
  protected readonly feminine: boolean = false;
  protected abstract idOf(item: T): number;
  protected abstract nameOf(item: T): string;

  readonly items = signal<T[]>([]);
  readonly loaded = signal(false);
  readonly failed = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.failed.set(false);
    this.service.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loaded.set(true);
      },
      error: () => {
        this.failed.set(true);
        this.loaded.set(true);
      },
    });
  }

  async remove(item: T): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: `Excluir ${this.entityLabel}`,
      message: `Tem certeza que deseja excluir "${this.nameOf(item)}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!confirmed) return;

    const id = this.idOf(item);
    this.service.delete(id).subscribe(() => {
      this.items.update((items) => items.filter((current) => this.idOf(current) !== id));
      this.notifications.success(this.message('excluíd'));
    });
  }

  /** Ex.: message('cadastrad') -> "Cultura cadastrada com sucesso." */
  protected message(verbStem: string): string {
    const label = this.entityLabel.charAt(0).toUpperCase() + this.entityLabel.slice(1);
    return `${label} ${verbStem}${this.feminine ? 'a' : 'o'} com sucesso.`;
  }
}
