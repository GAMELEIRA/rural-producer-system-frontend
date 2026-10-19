import { Component, OnInit, inject, signal } from '@angular/core';
import { CulturaService } from '../../../core/cadastros/cadastros.services';
import { ImagemCatalogoComponent } from '../../../shared/components/imagem-catalogo/imagem-catalogo.component';
import { IMAGENS_CULTURAS } from '../../../core/models/imagens-catalogo';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ProdutoInput, ProdutoService } from '../../../core/cadastros/cadastros.services';
import { Produto, Cultura, UNIDADES_MEDIDA } from '../../../core/models/cadastros.model';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { CrudFormBase } from '../shared/crud-form.base';

@Component({
  selector: 'app-produto-form',
  imports: [ReactiveFormsModule, FormFieldComponent, ImagemCatalogoComponent],
  templateUrl: './produto-form.component.html',
})
export class ProdutoFormComponent extends CrudFormBase<Produto, ProdutoInput> implements OnInit {
  protected readonly service = inject(ProdutoService);
  protected readonly entityLabel = 'produto';
  protected readonly listRoute = '/produtos';

  protected readonly unidades = UNIDADES_MEDIDA;
  protected readonly imagens = IMAGENS_CULTURAS;
  protected readonly culturasApi = inject(CulturaService);
  readonly culturas = signal<Cultura[]>([]);

  override ngOnInit(): void {
    super.ngOnInit();
    this.culturasApi.list().subscribe({next:c=>this.culturas.set(c)});
  }

  aoEscolherCultura(): void {
    const cultura = this.culturas().find(c=>c.idCultura===this.form.controls.idCultura.value);
    if (!cultura) return;
    this.form.patchValue({nome:cultura.nome,imagemCodigo:cultura.imagemCodigo||'',imagemPersonalizada:cultura.imagemPersonalizada||''});
  }

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    idCultura: [null as number | null],
    imagemCodigo: [''],
    imagemPersonalizada: [''],
    unidadeMedida: ['kg', Validators.required],
    precoVenda: [null as number | null, [Validators.required, Validators.min(0)]],
    quantidadeEstoque: [0, [Validators.required, Validators.min(0)]],
    observacoes: ['', Validators.maxLength(500)],
  });

  protected patchForm(item: Produto): void {
    this.form.patchValue({ ...item, observacoes: item.observacoes ?? '', imagemCodigo:item.imagemCodigo ?? '', imagemPersonalizada:item.imagemPersonalizada ?? '', idCultura:item.idCultura ?? null });
  }

  protected buildPayload(): ProdutoInput {
    const value = this.form.getRawValue();
    return {
      nome: value.nome.trim(),
      idCultura: value.idCultura,
      imagemCodigo: value.imagemCodigo || null,
      imagemPersonalizada: value.imagemPersonalizada || null,
      unidadeMedida: value.unidadeMedida,
      precoVenda: Number(value.precoVenda),
      quantidadeEstoque: Number(value.quantidadeEstoque),
      observacoes: value.observacoes.trim() || undefined,
    };
  }
}
