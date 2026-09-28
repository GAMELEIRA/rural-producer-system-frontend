import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ProdutoInput, ProdutoService } from '../../../core/cadastros/cadastros.services';
import { Produto, UNIDADES_MEDIDA } from '../../../core/models/cadastros.model';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { CrudFormBase } from '../shared/crud-form.base';

@Component({
  selector: 'app-produto-form',
  imports: [ReactiveFormsModule, FormFieldComponent],
  templateUrl: './produto-form.component.html',
})
export class ProdutoFormComponent extends CrudFormBase<Produto, ProdutoInput> {
  protected readonly service = inject(ProdutoService);
  protected readonly entityLabel = 'produto';
  protected readonly listRoute = '/produtos';

  protected readonly unidades = UNIDADES_MEDIDA;

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    unidadeMedida: ['kg', Validators.required],
    precoVenda: [null as number | null, [Validators.required, Validators.min(0)]],
    quantidadeEstoque: [0, [Validators.required, Validators.min(0)]],
    observacoes: ['', Validators.maxLength(500)],
  });

  protected patchForm(item: Produto): void {
    this.form.patchValue({ ...item, observacoes: item.observacoes ?? '' });
  }

  protected buildPayload(): ProdutoInput {
    const value = this.form.getRawValue();
    return {
      nome: value.nome.trim(),
      unidadeMedida: value.unidadeMedida,
      precoVenda: Number(value.precoVenda),
      quantidadeEstoque: Number(value.quantidadeEstoque),
      observacoes: value.observacoes.trim() || undefined,
    };
  }
}
