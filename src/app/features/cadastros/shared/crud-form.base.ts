import { Directive, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudApiService } from '../../../core/cadastros/crud-api.service';
import { NotificationService } from '../../../core/notifications/notification.service';

/**
 * Comportamento comum dos formulários de cadastro/edição.
 * Rota `.../novo` cria; rota `.../:id` carrega o registro e atualiza.
 */
@Directive()
export abstract class CrudFormBase<T, TInput> implements OnInit {
  protected readonly fb = inject(FormBuilder).nonNullable;
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly notifications = inject(NotificationService);

  protected abstract readonly service: CrudApiService<T, TInput>;
  /** Nome da entidade em minúsculas, no singular (ex.: "cultura"). */
  protected abstract readonly entityLabel: string;
  /** Gênero gramatical do rótulo, para concordância nas mensagens. */
  protected readonly feminine: boolean = false;
  /** Rota da listagem para onde voltar após salvar/cancelar. */
  protected abstract readonly listRoute: string;
  abstract readonly form: FormGroup;

  protected abstract patchForm(item: T): void;
  protected abstract buildPayload(): TInput;

  readonly id = signal<number | null>(null);
  readonly isEdit = computed(() => this.id() !== null);

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (!param) return;

    const id = Number(param);
    this.id.set(id);
    this.service.getById(id).subscribe({
      next: (item) => this.patchForm(item),
      error: () => this.router.navigate([this.listRoute]),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifications.error('Verifique os campos destacados antes de salvar.');
      return;
    }

    const payload = this.buildPayload();
    const id = this.id();
    const request$ = id === null ? this.service.create(payload) : this.service.update(id, payload);

    request$.subscribe(() => {
      this.notifications.success(this.message(id === null ? 'cadastrad' : 'atualizad'));
      this.router.navigate([this.listRoute]);
    });
  }

  cancel(): void {
    this.router.navigate([this.listRoute]);
  }

  /** Ex.: message('cadastrad') -> "Cultura cadastrada com sucesso." */
  protected message(verbStem: string): string {
    const label = this.entityLabel.charAt(0).toUpperCase() + this.entityLabel.slice(1);
    return `${label} ${verbStem}${this.feminine ? 'a' : 'o'} com sucesso.`;
  }
}
