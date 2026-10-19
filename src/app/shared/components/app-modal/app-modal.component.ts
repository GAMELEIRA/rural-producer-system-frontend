import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

/** Diálogo reutilizável para detalhes e operações que não devem expandir a página. */
@Component({
  selector: 'app-modal',
  template: `
    <div class="modal-overlay" (click)="clicouFora($event)" role="presentation">
      <section class="modal-dialog" role="dialog" aria-modal="true" [attr.aria-label]="titulo" tabindex="-1">
        <div class="modal-header">
          <h2>{{titulo}}</h2>
          <button class="btn btn--ghost btn--sm" type="button" (click)="fechado.emit()" aria-label="Fechar detalhes">✕</button>
        </div>
        <div class="modal-content"><ng-content></ng-content></div>
      </section>
    </div>
  `,
  styles: [`
    .modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(9,20,14,.68);display:flex;
      justify-content:center;align-items:center;padding:1rem;overflow-y:auto}
    .modal-dialog{background:var(--color-surface,#fff);color:var(--color-text,#1f2937);border-radius:14px;
      max-width:850px;width:min(850px,100%);max-height:calc(100vh - 2rem);display:flex;flex-direction:column;
      box-shadow:0 18px 50px rgba(0,0,0,.3);outline:none}
    .modal-header{padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;
      gap:1rem;border-bottom:1px solid var(--color-border,#ddd)}
    .modal-header h2{margin:0;font-size:1.25rem}
    .modal-content{padding:1.25rem;overflow-y:auto}
  `]
})
export class AppModalComponent {
  @Input() titulo='Detalhes';
  @Output() fechado=new EventEmitter<void>();
  @HostListener('document:keydown.escape')
  aoEsc(){this.fechado.emit();}
  clicouFora(event:MouseEvent){if(event.target===event.currentTarget)this.fechado.emit();}
}
