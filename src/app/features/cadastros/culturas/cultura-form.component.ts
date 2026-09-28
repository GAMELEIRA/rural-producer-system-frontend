import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CulturaInput, CulturaService } from '../../../core/cadastros/cadastros.services';
import { Cultura, TIPOS_CULTURA, UNIDADES_CICLO } from '../../../core/models/cadastros.model';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { CrudFormBase } from '../shared/crud-form.base';

@Component({
  selector: 'app-cultura-form',
  imports: [ReactiveFormsModule, FormFieldComponent],
  templateUrl: './cultura-form.component.html',
})
export class CulturaFormComponent extends CrudFormBase<Cultura, CulturaInput> {
  protected readonly service = inject(CulturaService);
  protected readonly entityLabel = 'cultura';
  protected override readonly feminine = true;
  protected readonly listRoute = '/culturas';

  protected readonly tipos = TIPOS_CULTURA;
  protected readonly unidades = UNIDADES_CICLO;

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    tipo: ['', Validators.required],
    cicloEstimado: [null as number | null, [Validators.required, Validators.min(1)]],
    unidadeCiclo: ['dias', Validators.required],
    observacoes: ['', Validators.maxLength(500)],
  });

  protected patchForm(item: Cultura): void {
    this.form.patchValue({ ...item, observacoes: item.observacoes ?? '' });
  }

  protected buildPayload(): CulturaInput {
    const value = this.form.getRawValue();
    return {
      nome: value.nome.trim(),
      tipo: value.tipo,
      cicloEstimado: Number(value.cicloEstimado),
      unidadeCiclo: value.unidadeCiclo,
      observacoes: value.observacoes.trim() || undefined,
    };
  }
}
