import { Component, inject } from '@angular/core';
import { ImagemCatalogoComponent } from '../../../shared/components/imagem-catalogo/imagem-catalogo.component';
import { IMAGENS_CULTURAS } from '../../../core/models/imagens-catalogo';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CulturaInput, CulturaService } from '../../../core/cadastros/cadastros.services';
import { Cultura, TIPOS_CULTURA, UNIDADES_CICLO } from '../../../core/models/cadastros.model';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { CrudFormBase } from '../shared/crud-form.base';

@Component({
  selector: 'app-cultura-form',
  imports: [ReactiveFormsModule, FormFieldComponent, ImagemCatalogoComponent],
  templateUrl: './cultura-form.component.html',
})
export class CulturaFormComponent extends CrudFormBase<Cultura, CulturaInput> {
  protected readonly service = inject(CulturaService);
  protected readonly entityLabel = 'cultura';
  protected override readonly feminine = true;
  protected readonly listRoute = '/culturas';

  protected readonly tipos = TIPOS_CULTURA;
  protected readonly unidades = UNIDADES_CICLO;
  protected readonly imagens = IMAGENS_CULTURAS;

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    tipo: ['', Validators.required],
    cicloEstimado: [null as number | null, [Validators.required, Validators.min(1)]],
    unidadeCiclo: ['dias', Validators.required],
    observacoes: ['', Validators.maxLength(500)],
    imagemCodigo: [''],
    imagemPersonalizada: [''],
  });

  protected patchForm(item: Cultura): void {
    this.form.patchValue({ ...item, observacoes: item.observacoes ?? '', imagemCodigo: item.imagemCodigo ?? '', imagemPersonalizada: item.imagemPersonalizada ?? '' });
  }

  protected buildPayload(): CulturaInput {
    const value = this.form.getRawValue();
    return {
      nome: value.nome.trim(),
      tipo: value.tipo,
      cicloEstimado: Number(value.cicloEstimado),
      unidadeCiclo: value.unidadeCiclo,
      observacoes: value.observacoes.trim() || undefined,
      imagemCodigo: value.imagemCodigo || null,
      imagemPersonalizada: value.imagemPersonalizada || null,
    };
  }
}
