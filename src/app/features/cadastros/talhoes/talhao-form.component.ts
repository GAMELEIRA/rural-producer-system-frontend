import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TalhaoInput, TalhaoService } from '../../../core/cadastros/cadastros.services';
import { Talhao, UNIDADES_AREA } from '../../../core/models/cadastros.model';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { CrudFormBase } from '../shared/crud-form.base';

@Component({
  selector: 'app-talhao-form',
  imports: [ReactiveFormsModule, FormFieldComponent],
  templateUrl: './talhao-form.component.html',
})
export class TalhaoFormComponent extends CrudFormBase<Talhao, TalhaoInput> {
  protected readonly service = inject(TalhaoService);
  protected readonly entityLabel = 'talhão';
  protected readonly listRoute = '/talhoes';

  protected readonly unidades = UNIDADES_AREA;

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    area: [null as number | null, [Validators.required, Validators.min(0.01)]],
    unidadeArea: ['ha', Validators.required],
    localizacao: ['', [Validators.required, Validators.maxLength(200)]],
    observacoes: ['', Validators.maxLength(500)],
  });

  protected patchForm(item: Talhao): void {
    this.form.patchValue({ ...item, observacoes: item.observacoes ?? '' });
  }

  protected buildPayload(): TalhaoInput {
    const value = this.form.getRawValue();
    return {
      nome: value.nome.trim(),
      area: Number(value.area),
      unidadeArea: value.unidadeArea,
      localizacao: value.localizacao.trim(),
      observacoes: value.observacoes.trim() || undefined,
    };
  }
}
