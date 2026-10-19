import { Component, inject } from '@angular/core';
import { ImagemCatalogoComponent } from '../../../shared/components/imagem-catalogo/imagem-catalogo.component';
import { IMAGENS_INSUMOS } from '../../../core/models/imagens-catalogo';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InsumoInput, InsumoService } from '../../../core/cadastros/cadastros.services';
import { Insumo, TIPOS_INSUMO, UNIDADES_MEDIDA } from '../../../core/models/cadastros.model';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { CrudFormBase } from '../shared/crud-form.base';

@Component({
  selector: 'app-insumo-form',
  imports: [ReactiveFormsModule, FormFieldComponent, ImagemCatalogoComponent],
  templateUrl: './insumo-form.component.html',
})
export class InsumoFormComponent extends CrudFormBase<Insumo, InsumoInput> {
  protected readonly service = inject(InsumoService);
  protected readonly entityLabel = 'insumo';
  protected readonly listRoute = '/insumos';

  protected readonly tipos = TIPOS_INSUMO;
  protected readonly unidades = UNIDADES_MEDIDA;
  protected readonly imagens = IMAGENS_INSUMOS;

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    tipo: ['', Validators.required],
    unidadeMedida: ['kg', Validators.required],
    quantidadeEstoque: [0, [Validators.required, Validators.min(0)]],
    precoUnitario: [null as number | null, [Validators.required, Validators.min(0)]],
    observacoes: ['', Validators.maxLength(500)],
    imagemCodigo: [''],
  });

  protected patchForm(item: Insumo): void {
    this.form.patchValue({ ...item, observacoes: item.observacoes ?? '', imagemCodigo: item.imagemCodigo ?? '' });
  }

  protected buildPayload(): InsumoInput {
    const value = this.form.getRawValue();
    return {
      nome: value.nome.trim(),
      tipo: value.tipo,
      unidadeMedida: value.unidadeMedida,
      quantidadeEstoque: Number(value.quantidadeEstoque),
      precoUnitario: Number(value.precoUnitario),
      observacoes: value.observacoes.trim() || undefined,
      imagemCodigo: value.imagemCodigo || null,
    };
  }
}
