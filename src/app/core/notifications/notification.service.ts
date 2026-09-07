import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

const DEFAULT_DURATION_MS = 5000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly items = signal<Notification[]>([]);
  private nextId = 0;

  readonly notifications = this.items.asReadonly();

  success(message: string, duration = DEFAULT_DURATION_MS): void {
    this.push('success', message, duration);
  }

  error(message: string, duration = DEFAULT_DURATION_MS): void {
    this.push('error', message, duration);
  }

  info(message: string, duration = DEFAULT_DURATION_MS): void {
    this.push('info', message, duration);
  }

  dismiss(id: number): void {
    this.items.update((list) => list.filter((n) => n.id !== id));
  }

  private push(type: NotificationType, message: string, duration: number): void {
    const id = ++this.nextId;
    this.items.update((list) => [...list, { id, type, message }]);
    if (duration > 0) setTimeout(() => this.dismiss(id), duration);
  }
}
