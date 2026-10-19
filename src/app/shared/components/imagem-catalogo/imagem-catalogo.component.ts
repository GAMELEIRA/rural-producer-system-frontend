import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImagemCatalogo } from '../../../core/models/imagens-catalogo';

@Component({
  selector: 'app-imagem-catalogo',
  template: `
    <div class="picker" role="group" aria-label="Imagem ilustrativa opcional">
      <p>Imagem ilustrativa (opcional). Escolha uma imagem do catálogo ou deixe sem imagem.</p>
      <div class="picker__grid">
        <button type="button" class="picker__item" [class.picker__item--active]="!selected"
                [attr.aria-pressed]="!selected" (click)="selectedChange.emit('')">
          <span class="picker__emoji">—</span><span>Sem imagem</span>
        </button>
        @for (imagem of items; track imagem.codigo) {
          <button type="button" class="picker__item"
                  [class.picker__item--active]="selected === imagem.codigo"
                  [attr.aria-pressed]="selected === imagem.codigo"
                  [attr.aria-label]="'Selecionar imagem: ' + imagem.nome"
                  (click)="selectedChange.emit(imagem.codigo)">
            <img [src]="imagem.url" [alt]="imagem.nome" loading="lazy" />
            <span>{{imagem.nome}}</span>
          </button>
        }
      </div>
      <small>Ilustrações: Twemoji (CC BY 4.0). A seleção não é obrigatória.</small>
    </div>
  `,
  styles: [`
    .picker { width:100%; }
    .picker p {margin:0 0 .65rem;}
    .picker__grid {display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:.6rem;}
    .picker__item {display:flex;align-items:center;justify-content:center;flex-direction:column;gap:.35rem;
       border:1px solid var(--color-border,#d1d5db);border-radius:10px;background:var(--color-surface,#fff);
       padding:.65rem .35rem;cursor:pointer;font:inherit;min-height:105px;}
    .picker__item--active {outline:2px solid var(--color-primary,#267044);outline-offset:1px;}
    .picker__item img {width:52px;height:52px;object-fit:contain;}
    .picker__item span {font-size:.8rem;text-align:center;}
    .picker__emoji {font-size:2rem!important;}
    .picker small {display:block;margin-top:.5rem;opacity:.72;}
  `]
})
export class ImagemCatalogoComponent {
  @Input() items: readonly ImagemCatalogo[] = [];
  @Input() selected = '';
  @Output() selectedChange = new EventEmitter<string>();
}
