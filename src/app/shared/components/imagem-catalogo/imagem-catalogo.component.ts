import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { ImagemCatalogo } from '../../../core/models/imagens-catalogo';

@Component({
  selector: 'app-imagem-catalogo',
  template: `
  <div class="picker" role="group" aria-label="Seleção de imagem ilustrativa">
    <p>Imagem opcional: escolha do catálogo, envie uma foto sua ou mantenha sem imagem.</p>
    <label class="picker__upload">Adicionar minha imagem (JPG, PNG ou WEBP)
      <input type="file" accept="image/jpeg,image/png,image/webp" (change)="enviarArquivo($event)">
    </label>
    @if (erro()) {<p class="picker__error" role="alert">{{erro()}}</p>}
    @if (processando()) {<p role="status">Processando imagem...</p>}
    @if (personalizada) {
      <div class="picker__preview">
        <img [src]="personalizada" alt="Prévia da imagem enviada">
        <span>Imagem própria selecionada</span>
        <button type="button" class="btn btn--ghost btn--sm" (click)="limpar()">Remover</button>
      </div>
    }
    <div class="picker__search">
      <label>Pesquisar imagem por nome
        <input type="search" [value]="pesquisa()" (input)="pesquisa.set($any($event.target).value)"
               placeholder="Ex.: beterraba, alface, cenoura">
      </label>
    </div>
    <div class="picker__grid">
      <button type="button" class="picker__item" [class.picker__item--active]="!selected&&!personalizada"
        [attr.aria-pressed]="!selected&&!personalizada" (click)="limpar()">
        <span class="picker__emoji">—</span><span>Sem imagem</span>
      </button>
    </div>
    @for (grupo of grupos(); track grupo.nome) {
      <h4>{{grupo.nome}}</h4>
      <div class="picker__grid">
        @for (imagem of grupo.imagens; track imagem.codigo) {
          <button type="button" class="picker__item"
            [class.picker__item--active]="selected === imagem.codigo && !personalizada"
            [attr.aria-pressed]="selected === imagem.codigo && !personalizada"
            [attr.aria-label]="'Selecionar imagem: ' + imagem.nome"
            (click)="escolher(imagem.codigo)">
            <img [src]="imagem.url" [alt]="imagem.nome" loading="lazy">
            <span>{{imagem.nome}}</span>
          </button>
        }
      </div>
    } @empty {
      <p>Nenhuma imagem encontrada. Experimente outra pesquisa ou envie sua foto.</p>
    }
    <small>Ilustrações do catálogo: Twemoji (CC BY 4.0). A imagem própria fica vinculada apenas ao seu cadastro.</small>
  </div>
  `,
  styles:[`
    .picker{width:100%}.picker p{margin:0 0 .65rem}.picker h4{margin:1rem 0 .45rem}
    .picker__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:.6rem}
    .picker__item{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:.35rem;
      border:1px solid var(--color-border,#d1d5db);border-radius:10px;background:var(--color-surface,#fff);
      padding:.65rem .35rem;cursor:pointer;font:inherit;min-height:102px}
    .picker__item--active{outline:2px solid var(--color-primary,#267044);outline-offset:1px}
    .picker__item img{width:52px;height:52px;object-fit:contain}
    .picker__item span{font-size:.8rem;text-align:center}.picker__emoji{font-size:2rem!important}
    .picker__upload{display:block;margin:.75rem 0}.picker__upload input{display:block;margin-top:.4rem;max-width:100%}
    .picker__search{margin:.75rem 0}.picker__search input{max-width:360px;width:100%;display:block}
    .picker__preview{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap;margin:.75rem 0}
    .picker__preview img{height:80px;width:80px;object-fit:contain;border-radius:8px}
    .picker__error{color:var(--color-danger,#b91c1c)}.picker small{display:block;margin-top:.75rem;opacity:.8}
  `]
})
export class ImagemCatalogoComponent {
  @Input() items: readonly ImagemCatalogo[] = [];
  @Input() selected = '';
  @Input() personalizada = '';
  @Output() selectedChange = new EventEmitter<string>();
  @Output() personalizadaChange = new EventEmitter<string>();
  readonly pesquisa = signal('');
  readonly erro = signal('');
  readonly processando = signal(false);

  grupos(): {nome:string;imagens:ImagemCatalogo[]}[] {
    const texto = this.pesquisa().trim().toLocaleLowerCase('pt-BR');
    const grupos = new Map<string,ImagemCatalogo[]>();
    for (const imagem of this.items) {
      if (texto && !imagem.nome.toLocaleLowerCase('pt-BR').includes(texto)) continue;
      if (!grupos.has(imagem.grupo)) grupos.set(imagem.grupo, []);
      grupos.get(imagem.grupo)!.push(imagem);
    }
    return [...grupos].map(([nome,imagens])=>({nome,imagens}));
  }
  escolher(codigo:string) {
    this.selectedChange.emit(codigo);
    this.personalizadaChange.emit('');
    this.erro.set('');
  }
  limpar() { this.selectedChange.emit(''); this.personalizadaChange.emit('');this.erro.set(''); }
  async enviarArquivo(event:Event):Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8_000_000) {
      this.erro.set('Envie uma imagem PNG, JPG ou WEBP de até 8 MB.');return;
    }
    this.processando.set(true);this.erro.set('');
    const url = URL.createObjectURL(file);
    try {
      const foto = new Image();
      await new Promise<void>((resolve,reject)=>{foto.onload=()=>resolve();foto.onerror=()=>reject();foto.src=url;});
      const dimensao = Math.min(1,640/Math.max(foto.width,foto.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1,Math.round(foto.width*dimensao));
      canvas.height = Math.max(1,Math.round(foto.height*dimensao));
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error();
      ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(foto,0,0,canvas.width,canvas.height);
      let imagem = '';
      for (const qualidade of [0.82,0.7,0.55,0.4,0.25]) {
        imagem = canvas.toDataURL('image/jpeg',qualidade);
        if (imagem.length < 390_000) break;
      }
      if (imagem.length >= 390_000) throw new Error();
      this.selectedChange.emit('');
      this.personalizadaChange.emit(imagem);
    } catch {
      this.erro.set('Não foi possível processar essa imagem. Tente outra foto.');
    } finally {
      URL.revokeObjectURL(url);
      this.processando.set(false);
    }
  }
}
