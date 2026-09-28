import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <span class="empty-state__icon" aria-hidden="true">{{ icon() }}</span>
      <p class="empty-state__title">{{ title() }}</p>
      @if (message()) {
        <p class="empty-state__message">{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      padding: 3rem 1rem;
      text-align: center;
      color: var(--color-text-muted);

      &__icon {
        font-size: 2.5rem;
      }

      &__title {
        margin: 0;
        font-weight: 600;
        color: var(--color-text);
      }

      &__message {
        margin: 0 0 0.75rem;
        font-size: 0.9rem;
      }
    }
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly message = input<string>();
  readonly icon = input('🌾');
}
